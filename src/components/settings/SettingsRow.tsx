import React from 'react';

interface SettingsRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, hint, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-[22px] border-b border-[#E6E6E6] last:border-b-0">
    <div>
      <div className="text-[13px] font-bold text-[#1A1A1A]">{label}</div>
      {hint && <p className="text-[11px] text-[#808080] mt-1 leading-snug">{hint}</p>}
    </div>
    <div>{children}</div>
  </div>
);

export default SettingsRow;
