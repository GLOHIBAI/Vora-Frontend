import React from 'react';

interface PageActionBarProps {
  hint: React.ReactNode;
  children: React.ReactNode;
}

const PageActionBar: React.FC<PageActionBarProps> = ({ hint, children }) => (
  <div className="sticky -bottom-8 z-10 px-8 py-4 bg-white border-t border-[#E6E6E6] flex flex-wrap justify-between items-center gap-3">
    <p className="text-xs text-[#808080] leading-relaxed max-w-xl [&_strong]:text-[#92400E] [&_strong]:font-bold">
      {hint}
    </p>
    <div className="flex gap-2.5 flex-wrap">{children}</div>
  </div>
);

export default PageActionBar;
