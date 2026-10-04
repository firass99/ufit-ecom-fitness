import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import googleOauthConfig from '../configs/google-oauth.config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfig: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfig.clientID,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    console.log('THIS IS USER PROFILE:', profile); // Log the entire profile object

    // Check if emails and name are defined
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

    console.log('THIS IS USER DATA GGL:', userData);

    const user = await this.authService.validateOauthUser(userData);
    console.log('THIS IS USER REQ DATA FROM GGL STARTEGY:', user);

    done(null, user);
  }
}
