import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export default registerAs('refreshJwt', (): JwtSignOptions => {
  if (!process.env.REFRESH_JWT_SECRET) {
    throw new Error('REFRESH_JWT_SECRET is not set');
  }
  return {
    secret: process.env.REFRESH_JWT_SECRET,
    expiresIn: process.env.REFRESH_JWT_EXPIRE_IN || '7d',
  };
});
