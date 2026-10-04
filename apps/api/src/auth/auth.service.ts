import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { ConfigType } from '@nestjs/config';
import refreshJwtConfig from './configs/refreshJwt.config';
import * as argon2 from 'argon2';
import { CurrentUser } from './types/currentUser';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/authJwtPayload';
import * as nodemailer from 'nodemailer';
import { EmailLoginDto } from './dto/login-email.dto';
import Mail from 'nodemailer/lib/mailer';
import { LoginJwtPayload } from './types/loginJwtPayload';
import template from './const/template';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  // validate user by email
  async validateOauthUser(User: CreateUserDto) {
    const user = await this.usersService.findOneByEmail(User.email);
    if (!user) {
      return await this.usersService.create(User);
    }
    return user;
  }

  // validate user by id from access token
  async validateJwtUser(userId: string): Promise<CurrentUser> {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');

    const session = await this.sessionsService.findByUserId(userId);
    return { ...user, session };
  }

  //
  async login(userId: string) {
    const user = await this.validateJwtUser(userId);
    const { accessToken, refreshToken } = await this.generateTokens(user);

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.sessionsService.updateOrCreateSession(
      user.id,
      hashedRefreshToken,
    );
    this.usersService.update(userId, { isActive: true });

    return {
      userId: user.id,
      role: user.role, // ✅ include userRole
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(user: CurrentUser) {
    let session =
      user.session || (await this.sessionsService.findByUserId(user.id));

    if (!session) {
      const { refreshToken } = await this.generateTokenPayload(user);
      const hashedRefreshToken = await argon2.hash(refreshToken);
      session = await this.sessionsService.create(user.id, hashedRefreshToken);
    }

    return this.generateTokenPayload({ ...user, session }, session.id);
  }

  async generateTokenPayload(user: CurrentUser, sessionId?: string) {
    const payload: JwtPayload = {
      id: user.id,
      sessionId: sessionId || '',
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, this.refreshTokenConfig),
    };
  }

  // refresh tokens
  async refreshToken(userId: string, sessionId: string) {
    const user = await this.validateJwtUser(userId);
    const validSession = await this.sessionsService.findById(sessionId);

    if (!validSession) {
      this.logger.warn(`Refresh attempted with no valid session: ${sessionId}`);
      throw new UnauthorizedException('Invalid session');
    }

    // Verify the session belongs to the user
    if (validSession.userId !== userId) {
      this.logger.warn(`Session ${sessionId} does not belong to user ${userId}`);
      throw new UnauthorizedException('Session does not belong to user');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const newHashedRefreshToken = await argon2.hash(refreshToken);

    await this.sessionsService.updateOrCreateSession(
      userId,
      newHashedRefreshToken,
    );

    return {
      userId: user.id,
      role: user.role, // ✅ include userRole
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(
    userId: string,
    sessionId: string,
    hashedRefreshToken: string,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found, UnauthorizedException');
    }

    const session = await this.sessionsService.findById(sessionId);

    if (!session || !session.valid || session.userId !== userId) {
      this.logger.warn(`Invalid session on refresh-token validation: ${sessionId}`);
      throw new UnauthorizedException('Invalid session');
    }

    // Verify the incoming refresh token against the stored hashed token
    const isTokenValid = await argon2.verify(
      session.refreshToken,
      hashedRefreshToken,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.validateJwtUser(userId);
  }

  async logout(userId: string, sessionId?: string) {
    await this.usersService.update(userId, { isActive: false });

    if (sessionId) {
      await this.sessionsService.invalidateSessionById(sessionId);
    } else {
      await this.sessionsService.invalidateAllUserSessions(userId);
    }

    return { message: 'Logout successful' };
  }

  // MAIL SERVICE
  async generateLoginToken(email: string): Promise<string> {
    const newUser: CreateUserDto = {
      email,
      fullName: email.split('@')[0],
    };
    const user = await this.validateOauthUser(newUser);

    const payload: LoginJwtPayload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  async validateLoginToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return await this.usersService.findOneByEmail(payload.email);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async sendLoginEmail(email: string) {
    const token = await this.generateLoginToken(email);
    const loginUrl = `${process.env.API_BASE_URL}/auth/link/callback?token=${token}`;

    // Replace placeholder with actual login URL
    let emailTemplate = template.replace('{{loginUrl}}', loginUrl);

    const emailContent: EmailLoginDto = {
      recipient: email,
      subject: 'Your Login Link',
      text: `Click here to log in: ${loginUrl}`,
      html: emailTemplate,
    };
    return await this.sendLoginLink(emailContent);
  }

  async mailTransport() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT ?? '587', 10),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendLoginLink(emailLogin: EmailLoginDto) {
    const { from, recipient, subject, text, html } = emailLogin;
    const transporter = await this.mailTransport();

    const options: Mail.Options = {
      from: from ?? {
        name: process.env.APP_NAME,
        address: process.env.MAIL_DEFAULT_SENDER,
      },
      to: recipient,
      subject,
      text,
      html,
    };

    try {
      await transporter.sendMail(options);
    } catch (error) {
      this.logger.error(`Failed to send login email to ${recipient}`, error);
    }
  }

  // END MAIL SERVICE //
}
