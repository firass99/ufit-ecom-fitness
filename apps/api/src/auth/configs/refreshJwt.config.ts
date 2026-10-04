import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export default registerAs(
  'refreshJwt',
  (): JwtSignOptions => ({
    //, ():jwt : returns jwtmodule object
    secret:
      process.env.REFRESH_JWT_SECRET ||
      'd06e04302e28704f4051a251ef597aae6dbee6da99c0ffd23579aac34bb718d1', // Default value
    expiresIn: process.env.REFRESH_JWT_EXPIRE_IN || '7d',
  }),
);
