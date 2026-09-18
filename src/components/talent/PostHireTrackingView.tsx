import React from 'react';
import { 
  AlertTriangleIcon
} from '../common/Icons';
import Button from '../common/Button';
import Tag from '../common/Tag';
import { TRACKED_TALENTS } from '../../constants/mockData';

const PostHireTrackingView: React.FC = () => {

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overdue Banner */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[14px] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="p-2 bg-white rounded-full border border-[#FDE68A]">
          <AlertTriangleIcon size={18} className="text-[#92400E]" />
        </div>
        <p className="text-[13px] font-medium text-[#78350F] flex-1">
          <strong>1 overdue check-in.</strong> Amaka Okonkwo's 30-day check-in has not been completed. Your next candidate pipeline access will be paused in 3 days if not resolved.
        </p>
        <Button 
          variant="outline"
          fullWidth={false}
          className="px-6 py-2 !bg-[#60A5FA] hover:!bg-[#0047CC] !text-white text-[12px] font-semibold !border-none whitespace-nowrap min-h-0 transition-all duration-200 shadow-sm"
          onClick={() => {}}
        >
          Complete Now
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ACTIVE HIRES TRACKED', value: '4', sub: 'Across 3 roles' },
          { label: 'CHECK-INS OVERDUE', value: '1', sub: 'Action needed' },
          { label: 'REPORTS GENERATED', value: '1', sub: '1 cycle completed' },
          { label: 'AVG PREDICTION ACCURACY', value: '89%', sub: 'Across completed cycles' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
            <p className="text-[28px] font-medium text-gray-900 leading-none mb-2">{stat.value}</p>
            <p className="text-[11px] font-medium text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Talent Tracking Table */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
        <div className="bg-[#F9FAFB] px-8 py-4 flex items-center text-[11px] font-medium text-gray-400 uppercase tracking-widest">
          <div className="flex-[2.5]">Name / Role</div>
          <div className="flex-1">Hired</div>
          <div className="flex-1">Score</div>
          <div className="flex-[1.5]">Next Action</div>
          <div className="flex-[2]">Tracking Status</div>
          <div className="w-24"></div>
        </div>
        <div className="divide-y divide-gray-50">
          {TRACKED_TALENTS.map((talent, idx) => (
            <div key={idx} className="px-8 py-6 flex items-center hover:bg-gray-50/50 transition-colors cursor-pointer group">
              <div className="flex-[2.5] flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${talent.initialBg} text-white flex items-center justify-center font-medium text-[12px] shrink-0`}>
                  {talent.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-gray-900 truncate">{talent.name}</p>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">{talent.role}</p>
                </div>
              </div>
              <div className="flex-1 text-[13px] font-medium text-gray-500">{talent.hired}</div>
              <div className="flex-1 text-[14px] font-semibold text-gray-800">{talent.score}</div>
              <div className="flex-[1.5]">
                <p className={`text-[12px] font-semibold ${talent.nextAction.includes('overdue') ? 'text-gray-900' : 'text-gray-700'}`}>{talent.nextAction}</p>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">{talent.actionSub}</p>
              </div>
              <div className="flex-[2]">
                <Tag 
                  label={talent.status}
                  variant={
                    talent.statusType === 'error' ? 'red' :
                    talent.statusType === 'success' ? 'green' :
                    talent.statusType === 'warning' ? 'yellow' : 'gray'
                  }
                />
              </div>
              <div className="w-24 flex justify-end">
                <Button 
                  variant={talent.btnText === 'View' ? 'outline' : 'primary'}
                  fullWidth={false}
                  className={`px-4 py-2 min-h-0 text-[12px] ${talent.btnColor} ${talent.btnText === 'View' ? 'border-gray-200' : 'border-none'}`}
                  onClick={() => {}}
                >
                  {talent.btnText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostHireTrackingView;
