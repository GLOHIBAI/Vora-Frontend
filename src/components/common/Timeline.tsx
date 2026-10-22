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
  done: 'bg-blue-50 text-[#0047CC] border-[#0047CC]',
  pending: 'bg-white text-[#0047CC] border-2 border-[#0047CC] ring-4 ring-blue-100',
  future: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const TimelineDot: React.FC<{ step: TimelineStep; fallbackNumber: number }> = ({ step, fallbackNumber }) => (
  <div
    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${dotStyles[step.status]}`}
  >
    {step.status === 'done' && <CheckIcon size={12} strokeWidth={3} />}
    {step.status === 'pending' && <span className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
    {step.status === 'future' && (step.stepNumber ?? fallbackNumber)}
  </div>
);

const Timeline: React.FC<TimelineProps> = ({ title, steps, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-6 mb-5 ${className}`}>
    {title && <CardTitle as="h2" className="text-base font-semibold text-slate-900 mb-4">{title}</CardTitle>}
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={`${step.title}-${index}`} className="flex gap-3.5 items-start">
          <div className="flex flex-col items-center shrink-0">
            <TimelineDot step={step} fallbackNumber={index + 1} />
            {index < steps.length - 1 && (
              <div className="w-0.5 h-10 bg-slate-200 mt-1.5" />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1 pt-0.5">
            <h4 className="text-base font-semibold text-slate-900 mb-1">{step.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">{step.description}</p>
            {step.dateLabel && (
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {step.dateLabel}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Timeline;
