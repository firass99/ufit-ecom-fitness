import { Session } from './session';

export type CurrentUser = {
  id: string;
  session: Session | null;
  fullName: string;
  email: string;
  role: string;
};
