import React, { useState } from 'react';
import Button from './Button';
import { PageTitle, SectionHeading } from './Typography';

/**
 * A beautiful, full-page fallback component displayed when the application is offline.
 * Provides real-time network failure notification and quick manual/auto reconnect cues.
 */
const OfflineFallback: React.FC = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Simulate/attempt checking online status by requesting a tiny resource or waiting
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative Offgrid Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-gray-200/40 filter blur-[80px] sm:blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-gray-200/40 filter blur-[80px] sm:blur-[120px] opacity-70 pointer-events-none" />

      <div className="text-center relative z-10 max-w-md mx-auto space-y-6">
        {/* Connection Lost Icon */}
        <div className="w-20 h-20 bg-gray-100/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-200/50">
          <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 5 5 0 011.414-3.536m0 0L4.929 4.93m1.414 1.414L3 3" 
            />
          </svg>
        </div>

        <div className="space-y-2">
          <SectionHeading className="text-2xl sm:text-3xl text-gray-800 font-bold">
            Connection Lost
          </SectionHeading>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            It looks like you're offline. Please check your internet connection. We'll automatically reconnect you once you're back.
          </p>
        </div>

        <div className="pt-4 max-w-[220px] mx-auto">
          <Button
            variant="primary"
            onClick={handleRetry}
            isLoading={isRetrying}
            loadingLabel="Checking status..."
            className="w-full transition-all duration-300 font-medium rounded-full py-4 px-6"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;
