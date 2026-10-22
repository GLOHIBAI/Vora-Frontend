import React from 'react';
import ContentCard from './ContentCard';
import { CheckIcon } from './Icons';

interface BulletListCardProps {
  title: string;
  items: string[];
  className?: string;
  icon?: React.ReactNode;
}

const BulletListCard: React.FC<BulletListCardProps> = ({ title, items, className = '', icon }) => (
  <ContentCard title={title} className={className}>
    <ul className="space-y-2.5 -mt-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-800 leading-relaxed">
          <span className="shrink-0 mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-blue-50 text-[#0047CC]">
            {icon ?? <CheckIcon size={9} strokeWidth={3} />}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </ContentCard>
);

export default BulletListCard;
