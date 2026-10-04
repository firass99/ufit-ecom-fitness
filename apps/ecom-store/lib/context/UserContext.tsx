'use client';

import { createContext, useContext } from 'react';
import { User } from '../types/user';

interface UserContextType {
  user: User | null;
}

export const UserContext = createContext<UserContextType>({
  user: null,
});

export const useUser = () => useContext(UserContext);
