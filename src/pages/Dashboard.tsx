import React from 'react';
import { Link } from 'react-router-dom';
import { FlashIcon, RefreshIcon, GridIcon } from '../components/common/Icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2 font-['Nunito_Sans']">
        Project Dashboard
      </h1>
      <p className="text-gray-500 mb-8">
        Welcome to the Vora Scaling Project. This architecture is designed for high reusability and minimal performance overhead.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Performance Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2">
            <FlashIcon className="w-5 h-5 text-[#0052cc]" />
            <h3 className="text-lg font-semibold text-[#1C1C1C]">Performance</h3>
          </div>
          <p className="text-sm text-gray-500 flex-1">
            Optimized with Tailwind CSS utility classes for rapid, lag-free development.
          </p>
          <button className="self-start px-4 py-2 text-sm font-medium text-[#0052cc] border border-[#0052cc] rounded-lg hover:bg-[#0052cc] hover:text-white transition-colors cursor-pointer mt-auto">
            View Metrics
          </button>
        </div>

        {/* Reusability Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2">
            <RefreshIcon className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="text-lg font-semibold text-[#1C1C1C]">Reusability</h3>
          </div>
          <p className="text-sm text-gray-500 flex-1">
            Atomic components in src/components ensure consistency and fast scaling across the project.
          </p>
          <button className="self-start px-4 py-2 text-sm font-medium text-[#7C3AED] border border-[#7C3AED] rounded-lg hover:bg-[#7C3AED] hover:text-white transition-colors cursor-pointer mt-auto">
            Explore Library
          </button>
        </div>

        {/* Structure Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2">
            <GridIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-[#1C1C1C]">Structure</h3>
          </div>
          <p className="text-sm text-gray-500 flex-1">
            Clean directory structure separating hooks, layouts, and page-level logic.
          </p>
          <button className="self-start px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer mt-auto">
            Docs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
