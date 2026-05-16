import React from 'react';
import { ProgressArc } from '../common/Icons';
import type { CircularProgressProps } from '../../types';

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 12,
  color = '#0047CC',
}) => {
  return (
    <div className="flex flex-col items-center justify-center relative pt-2" style={{ width: size, height: size / 1.6 }}>
      <ProgressArc 
        size={size} 
        strokeWidth={strokeWidth} 
        percentage={percentage} 
        color={color} 
      />
      <div className="absolute inset-0 flex items-center justify-center translate-y-2">
        <span className="text-[32px] font-bold text-gray-900 tracking-tight mt-8">{percentage}%</span>
      </div>
    </div>
  );
};

export default CircularProgress;
