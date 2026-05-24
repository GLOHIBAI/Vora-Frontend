import React from 'react';
import { SectionDescription, Subheading } from '../common/Typography';

interface StepCardProps {
  step: number;
  title: string;
  description?: string;
  stepColor?: 'blue' | 'green';
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  description,
  stepColor = 'blue',
  headerExtra,
  children,
  className = '',
}) => (
  <div
    className={`bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-5 mb-4 ${className}`}
  >
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${
            stepColor === 'green' ? 'bg-[#2CA62C]' : 'bg-[#0047CC]'
          }`}
        >
          {step}
        </div>
        <div>
          <Subheading className="text-[14px]">{title}</Subheading>
          {description && (
            <SectionDescription className="text-[12px] mt-0.5">{description}</SectionDescription>
          )}
        </div>
      </div>
      {headerExtra}
    </div>
    {children}
  </div>
);

export default StepCard;
