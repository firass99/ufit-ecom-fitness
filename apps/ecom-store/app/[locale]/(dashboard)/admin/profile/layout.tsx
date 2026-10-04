import { ReactNode } from 'react';

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="flex justify-center items-start py-4 px-4 md:px-2  min-h-screen">
      <div className="w-full bg-background rounded-xl shadow-md p-6">
        {children}
      </div>
    </div>
  );
}
