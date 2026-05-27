import React from 'react';
import { PageTitle, SectionDescription } from './Typography';

interface ConfirmationHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  iconWrapperClassName?: string;
}

const ConfirmationHeader: React.FC<ConfirmationHeaderProps> = ({
  icon,
  title,
  subtitle,
  iconWrapperClassName = 'bg-[#EEFBEE] border-[#85E585]',
}) => (
  <div className="text-center mb-8">
    <div
      className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5 border-[3px] ${iconWrapperClassName}`}
    >
      {icon}
    </div>
    <PageTitle className="text-[28px] mb-2">{title}</PageTitle>
    <SectionDescription className="text-[15px] max-w-xl mx-auto">{subtitle}</SectionDescription>
  </div>
);

export default ConfirmationHeader;
