import React from 'react';
import type { JobCardProps } from '../../types';
import { parseCompensation } from '../../utils/currency';

const JobCard: React.FC<JobCardProps> = ({ 
  logo, 
  title, 
  company, 
  location, 
  postedAt, 
  salary, 
  period: explicitPeriod,
  description, 
  tags = [] 
}) => {
  const { amount: displaySalary, period: parsedPeriod } = parseCompensation(salary);
  const displayPeriod = explicitPeriod || parsedPeriod;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group cursor-pointer flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden border border-gray-50 group-hover:scale-105 transition-transform">
              {logo ? (
                <img src={logo} alt={company || 'Company'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#0047CC] font-bold text-lg">
                  {company?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 
                className="font-semibold text-gray-900 group-hover:text-[#0047CC] transition-colors truncate text-sm sm:text-base"
                title={title}
              >
                {title}
              </h3>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider truncate">
                {company || 'Company'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#0047CC] font-semibold text-sm whitespace-nowrap">
              {displaySalary}
            </p>
            {displayPeriod && (
              <p className="text-[11px] text-gray-400 font-medium capitalize mt-0.5">
                {displayPeriod}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-4 font-medium">
          <span>{location}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>Posted {postedAt}</span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {tags.map((tag, idx) => (
          <span 
            key={idx} 
            className="px-3 py-1 bg-[#0047CC] text-white text-[10px] font-medium rounded-lg tracking-wide hover:bg-[#003d99] transition-colors cursor-default"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default JobCard;
