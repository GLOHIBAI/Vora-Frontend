import React from 'react';
import { Link } from 'react-router-dom';

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
            <svg className="w-5 h-5 text-[#0052cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
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
            <svg className="w-5 h-5 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
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
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
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
