import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Define paths where navbar and footer should be hidden
  const hideLayoutPaths = ['/login', '/signup', '/verify-otp'];
  const isFullPage = hideLayoutPaths.includes(location.pathname) || location.pathname.startsWith('/onboard');

  return (
    <div className={`flex flex-col min-h-screen ${isFullPage ? 'bg-white' : 'bg-gray-50'}`}>
      {!isFullPage && (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-xl font-bold text-[#0052cc] no-underline">
                VORA
              </Link>
              <div className="flex items-center gap-2">
                <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link to="/settings" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Settings
                </Link>
                <button className="px-5 py-2 text-sm font-semibold text-white bg-[#0052cc] rounded-lg hover:bg-[#003d99] transition-colors cursor-pointer">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 ${isFullPage ? '' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {!isFullPage && (
        <footer className="py-6 border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Vora Scaling Project. Built for performance.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;
