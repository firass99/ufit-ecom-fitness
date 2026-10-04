import { User } from '@prisma/client';

export type Session = {
  id: string;
  userId: string;
  user: User;
  refreshToken: string | null;
  valid: boolean;
};
