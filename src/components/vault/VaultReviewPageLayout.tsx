import React from 'react';
import PageTopBackBar from '../common/PageTopBackBar';

interface VaultReviewPageLayoutProps {
  backTo: string;
  backLabel?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

/**
 * Vault confirmation / review screens — full-bleed top bar like Post Job,
 * scrollable content column below.
 */
const VaultReviewPageLayout: React.FC<VaultReviewPageLayoutProps> = ({
  backTo,
  backLabel = 'Vault dashboard',
  children,
  maxWidthClass = 'w-full',
}) => (
  <div className="-mx-4 lg:-mx-8 -mt-6 lg:-mt-10 flex flex-col min-h-[calc(100vh-80px)] bg-[#F7F7F7] w-[calc(100%+2rem)] lg:w-[calc(100%+4rem)] max-w-none">
    <PageTopBackBar to={backTo} label={backLabel} className="w-full" />
    <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
      <div
        className={`${maxWidthClass} px-6 md:px-8 lg:px-10 py-8 pb-16 animate-in fade-in duration-500 ${
          maxWidthClass === 'w-full' ? '' : 'mx-auto'
        }`}
      >
        {children}
      </div>
    </div>
  </div>
);

export default VaultReviewPageLayout;
