import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret:
      process.env.JWT_SECRET ||
      '06e04302e28704f4051a251ef597aae6dbee6da99c0ffd23579aac34bb718d1', // Default value
    signOptions: {
      expiresIn: process.env.JWT_EXPIRE_IN || '1d',
      // Default value
    },
  }),
);
