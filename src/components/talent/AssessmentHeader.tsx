import React from 'react';
import VoraLogo from '../common/VoraLogo';

interface AssessmentHeaderProps {
  leftContent?: React.ReactNode;
  middleContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  leftContent,
  middleContent,
  rightContent,
}) => {
  return (
    <header className="bg-white/96 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[12px] flex items-center justify-between sticky top-0 z-[50]">
      <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
        {leftContent || <VoraLogo size="sm" to="/dashboard" />}
      </span>
      
      {middleContent && (
        <div className="text-[12.5px] text-[#808080] font-[600]">
          {middleContent}
        </div>
      )}
      
      {rightContent && (
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          {rightContent}
        </div>
      )}
    </header>
  );
};

export default AssessmentHeader;
