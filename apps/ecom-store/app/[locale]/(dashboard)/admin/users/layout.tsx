import { ReactNode } from 'react';

interface UsersLayoutProps {
  children: ReactNode;
}

export default function UsersLayout({ children }: UsersLayoutProps) {
  return (
    <div className="flex justify-center items-start  px-4 md:px-2  min-h-screen">
      {/*       </div><div className="w-full bg-background rounded-xl shadow-md p-6">
       */}{' '}
      <div className="w-full bg-background rounded-xl shadow-md ">
        {children}
      </div>
    </div>
  );
}
