import React from 'react';
import { CardTitle } from './Typography';

interface ContentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** White bordered card shell — shared by vault review, settings sections, etc. */
const ContentCard: React.FC<ContentCardProps> = ({
  title,
  children,
  className = '',
  bodyClassName = '',
}) => (
  <div className={`bg-white border border-[#E6E6E6] rounded-xl mb-4 ${className}`}>
    <div className={title ? `px-6 py-5 ${bodyClassName}` : bodyClassName}>
      {title && (
        <CardTitle as="h2" className="text-[15px] mb-3">
          {title}
        </CardTitle>
      )}
      {children}
    </div>
  </div>
);

export default ContentCard;
