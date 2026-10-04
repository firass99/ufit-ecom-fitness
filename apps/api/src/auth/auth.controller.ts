import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshJwtGuard } from './guards/refershJwt.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/roles.enum';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //api for admin
  // @Roles('ADMIN') or @Roles(Roles.ADMIN)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  admin(@Req() req, @Res() res) {
    return res.json({ message: 'You are an ' + req.user.role, USER: req.user });
  }
  //api for user
  @Roles(Role.ATHLETE)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('user')
  athlete(@Req() req, @Res() res) {
    return res.json({ message: 'You are an ' + req.user.role, USER: req.user });
  }

  //api for user
  @Roles(Role.ATHLETE, Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('multi')
  multipleRole(@Req() req, @Res() res) {
    return res.json({
      message:
        'Welcome ' +
        req.user.fullName +
        ' You role is : ' +
        req.user.role +
        ' one of [ATHELETE OR ADMIN] ',
    });
  }

  // GOOGLE LOGIN CONTROLLER
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {
    console.log('GOOGLE LOGIN CONTROLLER');
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    console.log('this is reeq IDDDD: ', req.user.id);

    const { userId, role, accessToken, refreshToken } =
      await this.authService.login(req.user.id);
    console.log('GOOGLE CallBack CONTROLLER', {
      userId,
      role,
      accessToken,
      refreshToken,
    });
    // Set refreshToken as cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // set false only for localhost
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.redirect(
      `${process.env.UFITPAL_FRONT}/auth/socials/callback?accessToken=${accessToken}&userId=${userId}&role=${role}`,
    );
  }
  // END GOOGLE LOGIN CONTROLLER

  // FACEBOOK LOGIN CONTROLLER
  @UseGuards(FacebookAuthGuard)
  @Get('facebook/login')
  facebookLogin() {
    console.log('FACEBOOK LOGIN CONTROLLER');
  }

  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  async facebookCallback(@Req() req, @Res() res) {
    console.log('this is reeq IDDDD: ', req.user.id);

    const { userId, role, accessToken, refreshToken } =
      await this.authService.login(req.user.id);
    console.log('FACEBOOK CallBack CONTROLLER', {
      userId,
      role,
      accessToken,
      refreshToken,
    });
    // Set refreshToken as cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // set false only for localhost
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.redirect(
      `${process.env.UFITPAL_FRONT}/auth/socials/callback?accessToken=${accessToken}&userId=${userId}&role=${role}`,
    );
  }
  // END FACEBOOK LOGIN CONTROLLER

  // MAIL LOGIN CONTROLLER
  @Post('link/login')
  async linkLogin(@Body() body: { email: string }) {
    console.log('LINK LOGIN CONTROLLER', body.email);
    return await this.authService.sendLoginEmail(body.email);
  }

  @Get('link/callback')
  async linkCallback(@Query('token') token: string, @Res() res) {
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }
    console.log('Received token:', token); // Log the received token

    const user = await this.authService.validateLoginToken(token);
    console.log('NEW USER ADDED', user);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid or expired token FROM CONTROLLER',
      );
    }
    const { userId, role, accessToken, refreshToken } =
      await this.authService.login(user.id); // Use your existing login method
    console.log('LINK CALLBACK CONTROLLER', {
      userId,
      role,
      accessToken,
      refreshToken,
    });
    // Set refreshToken as cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // set false only for localhost
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.redirect(
      `${process.env.UFITPAL_FRONT}/auth/link/callback?accessToken=${accessToken}&userId=${userId}&role=${role}`,
    );
  }
  //END MAIL LOGIN CONTROLLER

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Req() req, @Res() res) {
    const resNewTokens = await this.authService.refreshToken(
      req.user.id,
      req.user.session.id,
    ); //req.user return from strategy
    return res.json(resNewTokens);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req, @Res() res) {
    console.log('this is profile : ', req.user);
    return res.json(req.user);
  }

  //LOGOUTS
  /*  @UseGuards(JwtAuthGuard)
   @Post('logout')
     async logout(@Req() req, @Res() res) {
       console.log('Logout request');
       const userId = req.user.id;
       const sessionId = req.user.session?.id;
       const result = await this.authService.logout(userId, sessionId);
   
       // Clear any client-side tokens or cookies if needed
       //res.clearCookie('access_token');
       res.clearCookie('refresh_token');
       return res.json(result);
     } */

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res() res) {
    await this.authService.logout(req.user.id, req.user.session?.id);
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out' });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAllSessions(@Req() req, @Res() res) {
    console.log('Logout all sessions request');
    const userId = req.user.id;
    const result = await this.authService.logout(userId);

    // Clear any client-side tokens or cookies if needed
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return res.json(result);
  }
}
