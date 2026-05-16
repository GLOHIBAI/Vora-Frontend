import React from 'react';
import { 
  AlertTriangleIcon, 
  CheckIcon, 
  TrendingUpIcon, 
  ClockIcon
} from '../common/Icons';
import Button from '../common/Button';
import { TRACKED_TALENTS } from '../../constants/mockData';

const PostHireTrackingView: React.FC = () => {

  const getStatusStyles = (type: string) => {
    switch(type) {
      case 'error': return 'bg-amber-50 text-amber-700 border-amber-100 dot-amber-500';
      case 'success': return 'bg-green-50 text-green-700 border-green-100 dot-green-500';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100 dot-amber-500'; // Screenshot shows orange for setup pending too
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-100 dot-purple-500';
      default: return 'bg-gray-50 text-gray-700 border-gray-100 dot-gray-500';
    }
  };

  const getDotColor = (type: string) => {
    switch(type) {
      case 'error': return 'bg-amber-500';
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overdue Banner */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[14px] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="p-2 bg-white rounded-full">
          <AlertTriangleIcon size={18} className="text-[#DC2626]" />
        </div>
        <p className="text-[13px] font-bold text-[#991B1B] flex-1">
          <strong>1 overdue check-in.</strong> Amaka Okonkwo's 30-day check-in has not been completed. Your next candidate pipeline access will be paused in 3 days if not resolved.
        </p>
        <Button 
          variant="outline"
          fullWidth={false}
          className="px-6 py-2 bg-[#DC2626] text-white text-[12px] font-black border-none hover:bg-[#b91c1c] whitespace-nowrap min-h-0"
          onClick={() => {}}
        >
          Complete Now
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ACTIVE HIRES TRACKED', value: '4', sub: 'Across 3 roles', icon: CheckIcon, color: 'text-gray-900' },
          { label: 'CHECK-INS OVERDUE', value: '1', sub: 'Action needed', icon: AlertTriangleIcon, color: 'text-red-600' },
          { label: 'REPORTS GENERATED', value: '1', sub: '1 cycle completed', icon: ClockIcon, color: 'text-gray-900' },
          { label: 'AVG PREDICTION ACCURACY', value: '89%', sub: 'Across completed cycles', icon: TrendingUpIcon, color: 'text-purple-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
            <p className={`text-[28px] font-black ${stat.color} leading-none mb-2`}>{stat.value}</p>
            <p className="text-[11px] font-bold text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Talent Tracking Table */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
        <div className="bg-[#F9FAFB] px-8 py-4 flex items-center text-[11px] font-black text-gray-400 uppercase tracking-widest">
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
                <div className={`w-10 h-10 rounded-full ${talent.initialBg} text-white flex items-center justify-center font-black text-[12px] shrink-0`}>
                  {talent.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-black text-gray-900 truncate">{talent.name}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{talent.role}</p>
                </div>
              </div>
              <div className="flex-1 text-[13px] font-bold text-gray-600">{talent.hired}</div>
              <div className="flex-1 text-[13px] font-black text-[#0047CC]">{talent.score}</div>
              <div className="flex-[1.5]">
                <p className={`text-[12px] font-black ${talent.nextAction.includes('overdue') ? 'text-red-600' : 'text-gray-900'}`}>{talent.nextAction}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{talent.actionSub}</p>
              </div>
              <div className="flex-[2]">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusStyles(talent.statusType)}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${getDotColor(talent.statusType)}`} />
                  <span className="text-[11px] font-black tracking-tight">{talent.status}</span>
                </div>
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
