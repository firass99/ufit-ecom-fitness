import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/authJwtPayload';
import jwtConfig from '../configs/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    // Extracts and pass to this func then return the user ID from the payload
    const userId = payload.id;
    console.log('LOCAL . JWT STRATEGY PAYLOAD ');
    console.log('JWT Payload :', payload);

    const user = await this.authService.validateJwtUser(userId);
    console.log('THIS IS USER FROM JWT STRATEGY', user);
    return user;
  }
}
