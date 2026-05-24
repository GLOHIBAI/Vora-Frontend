import React from 'react';
import { CheckIcon, ClockIcon } from './Icons';
import { CardTitle } from './Typography';
import type { TimelineStep, TimelineStepStatus } from '../../types/vault';

interface TimelineProps {
  title?: string;
  steps: TimelineStep[];
  className?: string;
}

const dotStyles: Record<TimelineStepStatus, string> = {
  done: 'bg-[#EEFBEE] text-[#135813] border-[#85E585]',
  pending: 'bg-[#EBF6FF] text-[#0047CC] border-[#BDD9FF]',
  future: 'bg-[#F7F7F7] text-[#ADADAD] border-[#E6E6E6]',
};

const TimelineDot: React.FC<{ step: TimelineStep }> = ({ step }) => (
  <div
    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-[12px] font-semibold ${dotStyles[step.status]}`}
  >
    {step.status === 'done' && <CheckIcon size={12} strokeWidth={3} />}
    {step.status === 'pending' && <ClockIcon size={10} strokeWidth={2.5} />}
    {step.status === 'future' && (step.stepNumber ?? '')}
  </div>
);

const Timeline: React.FC<TimelineProps> = ({ title, steps, className = '' }) => (
  <div className={`bg-white border border-[#E6E6E6] rounded-xl p-6 mb-5 ${className}`}>
    {title && <CardTitle as="h2" className="text-base mb-4">{title}</CardTitle>}
    <div>
      {steps.map((step, index) => (
        <div key={`${step.title}-${index}`} className="flex gap-3.5 items-start mb-4 last:mb-0">
          <div className="flex flex-col items-center shrink-0">
            <TimelineDot step={step} />
            {index < steps.length - 1 && (
              <div className="w-0.5 h-8 bg-[#E6E6E6] mt-1" />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h4 className="text-sm font-semibold text-[#1A1A1A] mb-0.5">{step.title}</h4>
            <p className="text-xs text-[#808080] leading-relaxed">{step.description}</p>
            {step.dateLabel && (
              <p className="text-[11px] font-bold text-[#0047CC] mt-1">{step.dateLabel}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Timeline;
