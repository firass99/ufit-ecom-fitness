import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import facebookOauthConfig from '../configs/facebook-oauth.config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    @Inject(facebookOauthConfig.KEY)
    private facebookConfig: ConfigType<typeof facebookOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: facebookConfig.clientID,
      clientSecret: facebookConfig.clientSecret,
      callbackURL: facebookConfig.callbackURL,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: unknown, user: unknown, info?: unknown) => void,
  ) {
    console.log('THIS IS USER PROFILE:', profile); // Log the entire profile object

    // Extract email and name from profile
    const email =
      profile.emails && profile.emails.length > 0
        ? profile.emails[0].value
        : null;
    const fullName = profile.name
      ? `${profile.name.givenName} ${profile.name.familyName}`
      : null;

    if (!email) {
      return done(new Error('Email not found in profile'), null);
    }

    if (!fullName) {
      return done(new Error('Full name not found in profile'), null);
    }

    const userData = {
      email,
      fullName,
    };

    console.log('THIS IS USER DATA:', userData);

    // Replace `validateOauthUser` with a suitable method for Facebook user validation
    const user = await this.authService.validateOauthUser(userData); // This should be a method similar to your Google one
    console.log('THIS IS USER  FCB STRAT REQ DATA:', user);

    done(null, user);
  }
}
