import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangleIcon, 
  PlusIcon
} from '../common/Icons';
import Tag from '../common/Tag';
import Spinner from '../common/Spinner';
import type { EmployerHiresResponse, EmployerHireItem } from '../../services/queries/employer/types';

interface HiredTabViewProps {
  data?: EmployerHiresResponse;
  isLoading?: boolean;
}

const HiredTabView: React.FC<HiredTabViewProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Spinner size={28} className="text-[#0047CC]" />
        <p className="text-[13px] font-medium text-gray-500">Loading hires…</p>
      </div>
    );
  }

  const banner = data?.bannerAlert;
  const hired = data?.items ?? [];

  // Open positions parsing
  const openPos = typeof data?.openPositions === 'object' ? data.openPositions : null;
  const canHireAnother = openPos?.canHireAnother ?? data?.canHireAnother ?? false;
  const stillOpen = openPos?.stillOpen ?? (typeof data?.openPositions === 'number' ? data.openPositions : 0);
  const advertised = openPos?.advertised ?? data?.totalPositions ?? 0;
  const openPositionsLabel = openPos?.label || (
    stillOpen > 0 
      ? `${stillOpen} position${stillOpen !== 1 ? 's' : ''} still open. ${advertised} positions were advertised.`
      : ''
  );

  const handleAction = (type?: string, hireId?: string, checkInId?: string, talentId?: string) => {
    if (type === 'COMPLETE_CHECK_IN' && checkInId) {
      navigate(`/post-hire/check-ins/${checkInId}/submit`);
    } else if (type === 'SET_BENCHMARKS' && hireId) {
      navigate(`/post-hire/${hireId}/benchmarks`);
    } else if (talentId) {
      navigate(`/talents/${talentId}`);
    } else if (hireId) {
      navigate(`/post-hire/${hireId}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overdue Alert Banner */}
      {banner?.hasUrgentAlert && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[14px] p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="p-2 bg-white rounded-full">
            <AlertTriangleIcon size={18} className="text-[#D97706]" />
          </div>
          <p className="text-[13px] font-medium text-[#92400E] flex-1">
            {banner.message || 'A check-in is overdue.'}
          </p>
          <button 
            onClick={() => handleAction(banner.actionType || 'COMPLETE_CHECK_IN', banner.hireId, banner.checkInId)}
            className="px-6 py-2 bg-red-600 text-white text-[12px] font-medium rounded-full hover:bg-red-700 transition-all whitespace-nowrap cursor-pointer border-none"
          >
            {banner.ctaText || banner.actionLabel || 'Complete Now'}
          </button>
        </div>
      )}

      {/* Hired Candidates Table */}
      {hired.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
          <div className="bg-[#F9FAFB] px-8 py-4 flex items-center text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            <div className="flex-[2]">Hire</div>
            <div className="flex-1">Hired</div>
            <div className="flex-[1.2]">Next check-in</div>
            <div className="flex-[1.2]">Tracking status</div>
            <div className="w-28 text-right">Action</div>
          </div>
          <div className="divide-y divide-gray-50">
            {hired.map((candidate: EmployerHireItem, idx: number) => {
              // Resolve next check-in
              const nextCheckInLabel = typeof candidate.nextCheckIn === 'object' 
                ? candidate.nextCheckIn.label 
                : candidate.nextCheckIn || '—';
              const nextCheckInDue = typeof candidate.nextCheckIn === 'object' 
                ? candidate.nextCheckIn.dueLabel 
                : candidate.nextCheckInSub;
              const isOverdue = typeof candidate.nextCheckIn === 'object' 
                ? candidate.nextCheckIn.overdue 
                : candidate.overdue;

              // Resolve action
              const actionObj = typeof candidate.action === 'object' ? candidate.action : null;
              const actionLabel = actionObj?.label || candidate.actionLabel || (isOverdue ? 'Complete check-in' : 'View');
              const actionType = actionObj?.type || (typeof candidate.action === 'string' ? candidate.action : undefined);
              const actionHireId = actionObj?.hireId || candidate.hireId;
              const actionCheckInId = actionObj?.checkInId || candidate.checkInId;

              // Resolve tracking status
              const trackingLabel = candidate.trackingStatusLabel || candidate.trackingStatus || '—';
              const trackingVariant = candidate.trackingStatusVariant || (isOverdue ? 'red' : 'green');

              // Initials
              const initials = candidate.talentInitials || 
                candidate.talentName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TR';

              return (
                <div 
                  key={idx} 
                  className={`px-8 py-6 flex items-center transition-colors group ${isOverdue ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-gray-50/50'}`}
                >
                  <div className="flex-[2] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0047CC] text-white flex items-center justify-center font-medium text-[12px] shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 truncate">{candidate.talentName}</p>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                        {candidate.applicantCode}
                        {candidate.assessmentScore !== undefined && ` · Interview: ${candidate.assessmentScore}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 text-[13px] font-medium text-gray-600">{candidate.hiredOn || '—'}</div>
                  <div className="flex-[1.2]">
                    <p className={`text-[12px] font-medium ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                      {nextCheckInLabel}
                    </p>
                    {nextCheckInDue && (
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">{nextCheckInDue}</p>
                    )}
                  </div>
                  <div className="flex-[1.2]">
                    <Tag 
                      label={trackingLabel} 
                      variant={trackingVariant as any} 
                    />
                  </div>
                  <div className="w-28 flex justify-end">
                    <button 
                      onClick={() => handleAction(actionType, actionHireId, actionCheckInId, candidate.talentId)}
                      className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        isOverdue 
                          ? 'bg-red-600 text-white border-none' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[20px]">
          <p className="text-[15px] font-medium text-gray-900">No hires yet</p>
          <p className="text-[13px] font-medium text-gray-400 mt-1">Hired candidates will appear here</p>
        </div>
      )}

      {/* Hire Another prompt */}
      {canHireAnother && stillOpen > 0 && (
        <div className="bg-white border-2 border-dashed border-[#387DFF]/30 rounded-[18px] p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#0047CC] shadow-sm">
            <PlusIcon size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[15px] font-medium text-gray-900">
              {stillOpen} position{stillOpen !== 1 ? 's' : ''} still open
            </p>
            <p className="text-[13px] font-medium text-gray-400 mt-1">
              {openPositionsLabel}
            </p>
          </div>
          <button 
            onClick={() => navigate('/jobs')}
            className="px-6 py-2.5 bg-[#0047CC] text-white text-[13px] font-medium rounded-full hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/10 whitespace-nowrap cursor-pointer border-none"
          >
            Hire Another
          </button>
        </div>
      )}
    </div>
  );
};

export default HiredTabView;
