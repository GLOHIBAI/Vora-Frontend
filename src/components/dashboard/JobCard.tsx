import React from 'react';

import type { JobCardProps } from '../../types';

const JobCard: React.FC<JobCardProps> = ({ 
  logo, 
  title, 
  company, 
  location, 
  postedAt, 
  salary, 
  description, 
  tags 
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden border border-gray-50 group-hover:scale-105 transition-transform">
            {logo ? (
              <img src={logo} alt={company} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#0047CC] font-bold text-lg">{company.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-[#0047CC] transition-colors">{title}</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{company}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#0047CC] font-bold">{salary}</p>
          <p className="text-[10px] text-gray-400 font-medium">monthly</p>
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

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span 
            key={idx} 
            className="px-3 py-1 bg-[#0047CC] text-white text-[10px] font-bold rounded-lg tracking-wide hover:bg-[#003d99] transition-colors cursor-default"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default JobCard;
