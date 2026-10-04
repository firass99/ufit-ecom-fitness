import { ReactNode } from 'react';

interface ProductsLayoutProps {
  children: ReactNode;
}

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return (
    <div className="flex justify-center items-start py-4 px-4 md:px-2  min-h-screen">
      <div className="w-full bg-background rounded-xl shadow-md ">
        {children}
      </div>
    </div>
  );
}
