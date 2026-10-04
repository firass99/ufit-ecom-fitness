// src/config/facebook-oauth.config.ts

import { registerAs } from '@nestjs/config';

export default registerAs('facebookOauth', () => ({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
}));
