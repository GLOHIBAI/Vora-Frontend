import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-white">
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
