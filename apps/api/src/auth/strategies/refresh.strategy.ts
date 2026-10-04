import { AuthService } from './../auth.service';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { Request } from 'express';
import refreshJwtConfig from '../configs/refreshJwt.config';
import { JwtPayload } from '../types/authJwtPayload';

//cause  we have 2 jwt strategy we rename the strategy
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refreshJwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    super({
      //fromBodyfield("refresh") and add a field in tha body
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshJwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  //if refresh token not expired we pass to validate()
  //if refresh token not expired we pass to validate()
  async validate(req: Request, payload: JwtPayload) {
    const hashedRefreshToken = await req
      .get('authorization')
      .replace('Bearer', '')
      .trim();
    const userId = payload.id;
    const sessionId = payload.sessionId;
    console.log('THIS IS REFRESH JWT STRATEGY');
    console.log('THIS IS PAYLOAD FROM REFRESH STRATEGY', payload);

    console.log('This is hashedRefreshToken :', hashedRefreshToken);

    const user = await this.authService.validateRefreshToken(
      userId,
      sessionId,
      hashedRefreshToken,
    );
    return user;
    //this return req.user
  }
}
