import React from 'react';
import { 
  AlertTriangleIcon, 
  PlusIcon
} from '../common/Icons';

const HiredTabView: React.FC = () => {
  const hired = [
    { 
      name: 'Amaka Okonkwo', 
      code: 'APP-004', 
      score: '86/100', 
      date: 'Jan 16, 2025', 
      nextAction: '30-day overdue', 
      actionSub: 'Was due Feb 15', 
      status: 'Check-in due', 
      statusType: 'error',
      initials: 'AO',
      initialBg: 'bg-[#0047CC]',
      overdue: true
    },
    { 
      name: 'Kwame Osei', 
      code: 'APP-007', 
      score: '79/100', 
      date: 'Jan 18, 2025', 
      nextAction: '60-day check-in', 
      actionSub: 'Due Mar 19, 2025', 
      status: 'On track', 
      statusType: 'success',
      initials: 'KO',
      initialBg: 'bg-[#2CA62C]',
      overdue: false
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overdue Alert Banner */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[14px] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="p-2 bg-white rounded-full">
          <AlertTriangleIcon size={18} className="text-[#D97706]" />
        </div>
        <p className="text-[13px] font-bold text-[#92400E] flex-1">
          <strong>1 check-in overdue.</strong> Amaka Okonkwo's 30-day check-in was due Feb 15. Complete it to keep your pipeline access active.
        </p>
        <button className="px-6 py-2 bg-red-600 text-white text-[12px] font-black rounded-full hover:bg-red-700 transition-all whitespace-nowrap cursor-pointer">
          Complete Now
        </button>
      </div>

      {/* Hired Candidates Table */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
        <div className="bg-[#F9FAFB] px-8 py-4 flex items-center text-[11px] font-black text-gray-400 uppercase tracking-widest">
          <div className="flex-[2]">Hire</div>
          <div className="flex-1">Hired</div>
          <div className="flex-[1.2]">Next check-in</div>
          <div className="flex-[1.2]">Tracking status</div>
          <div className="w-24">Action</div>
        </div>
        <div className="divide-y divide-gray-50">
          {hired.map((candidate, idx) => (
            <div key={idx} className={`px-8 py-6 flex items-center transition-colors cursor-pointer group ${candidate.overdue ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-gray-50/50'}`}>
              <div className="flex-[2] flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${candidate.initialBg} text-white flex items-center justify-center font-black text-[12px] shrink-0`}>
                  {candidate.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-black text-gray-900 truncate">{candidate.name}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{candidate.code} · Assessment: {candidate.score}</p>
                </div>
              </div>
              <div className="flex-1 text-[13px] font-bold text-gray-600">{candidate.date}</div>
              <div className="flex-[1.2]">
                <p className={`text-[12px] font-black ${candidate.overdue ? 'text-red-600' : 'text-gray-900'}`}>{candidate.nextAction}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{candidate.actionSub}</p>
              </div>
              <div className="flex-[1.2]">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${candidate.overdue ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${candidate.overdue ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="text-[11px] font-black tracking-tight">{candidate.status}</span>
                </div>
              </div>
              <div className="w-24 flex justify-end">
                <button className={`px-4 py-2 rounded-lg text-[12px] font-black transition-all hover:scale-105 active:scale-95 ${candidate.overdue ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
                  {candidate.overdue ? 'Check-in' : 'View'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Set benchmarks prompt for unhired slot */}
      <div className="bg-[#EBF6FF] border-2 border-dashed border-[#387DFF]/30 rounded-[18px] p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#0047CC] shadow-sm">
          <PlusIcon size={20} strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[15px] font-black text-gray-900">1 position still open</p>
          <p className="text-[13px] font-bold text-gray-400 mt-1">3 positions were advertised. 1 more hire is available for this role.</p>
        </div>
        <button className="px-6 py-2.5 bg-[#0047CC] text-white text-[13px] font-black rounded-full hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/10 whitespace-nowrap cursor-pointer">
          Hire Another
        </button>
      </div>
    </div>
  );
};

export default HiredTabView;
