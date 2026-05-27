import React from 'react';
import ContentCard from './ContentCard';

interface BulletListCardProps {
  title: string;
  items: string[];
  className?: string;
}

const BulletListCard: React.FC<BulletListCardProps> = ({ title, items, className = '' }) => (
  <ContentCard title={title} className={className}>
    <ul className="text-[13px] text-[#808080] leading-[1.8] list-disc pl-[18px] -mt-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </ContentCard>
);

export default BulletListCard;
