import React from 'react';

/** Full-screen blue spinner — use for background fetches, not button-triggered requests. */
const FullPageSpinner: React.FC = () => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    role="status"
    aria-label="Loading"
  >
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0047CC] border-t-transparent" />
  </div>
);

export default FullPageSpinner;
