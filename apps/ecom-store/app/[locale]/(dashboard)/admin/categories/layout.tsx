import { ReactNode } from 'react';

interface CategoriesLayoutProps {
  children: ReactNode;
}

export default function CategoriesLayout({ children }: CategoriesLayoutProps) {
  return (
    <div className="flex justify-center items-start py-4 px-4 md:px-2  min-h-screen">
      <div className="w-full bg-background rounded-xl shadow-md ">
        {children}
      </div>
    </div>
  );
}
