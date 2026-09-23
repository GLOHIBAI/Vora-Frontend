import React from 'react';
import { CardTitle } from '../common/Typography';

interface PaymentCardProps {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
  bodyClassName = '',
}) => (
  <div className={`bg-white border border-[#E6E6E6] rounded-xl mb-5 ${className}`}>
    <div className="px-5 py-4 border-b border-[#E6E6E6] rounded-t-xl flex items-center justify-between gap-3">
      <div>
        <CardTitle as="h2" className="text-[15px] font-medium">
          {title}
        </CardTitle>
        {subtitle && <p className="text-xs text-[#808080] mt-0.5">{subtitle}</p>}
      </div>
      {headerAction}
    </div>
    <div className={bodyClassName}>{children}</div>
  </div>
);

export default PaymentCard;
