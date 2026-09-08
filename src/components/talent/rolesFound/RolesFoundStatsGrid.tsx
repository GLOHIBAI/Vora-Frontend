import { ProgressArc } from '../../common/Icons';
import type { RolesFoundSummary } from '../../../types/talentRolesFound';

interface RolesFoundStatsGridProps {
  summary: RolesFoundSummary;
}

const RolesFoundStatsGrid: React.FC<RolesFoundStatsGridProps> = ({ summary }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
    <div className="bg-white border border-[#E6E6E6] rounded-2xl p-5 col-span-2 sm:col-span-1 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center">
      <p className="text-[13px] font-bold text-[#4A5568] mb-1">Career Readiness Score</p>
      <div className="relative w-[72px] h-[40px] overflow-hidden mt-3 mb-1">
        <ProgressArc
          size={72}
          strokeWidth={8}
          percentage={summary.careerReadinessScore}
          color="#0047CC"
          background="#F0F4F8"
          className="absolute top-0 left-0"
        />
        <div className="absolute bottom-0 left-0 right-0 text-center text-lg font-black text-[#1A1A1A] leading-none pb-0.5">
          {summary.careerReadinessScore}%
        </div>
      </div>
    </div>

    <div className="bg-white border border-[#E6E6E6] rounded-2xl p-5 flex flex-col justify-center shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]">
      <p className="text-[13px] font-bold text-[#4A5568] mb-1.5">Interview Grade</p>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xl font-bold text-[#0047CC]">Grade {summary.assessmentGrade}</span>
      </div>
      <p className="text-[11px] font-medium text-[#718096] mb-1.5">Based on your profile</p>
      <button type="button" className="text-[11px] text-[#387DFF] font-bold cursor-pointer hover:text-[#0047CC] text-left transition-colors">
        See how grades work
      </button>
    </div>

    <div className="bg-white border border-[#E6E6E6] rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]">
      <p className="text-[13px] font-bold text-[#4A5568] mb-1.5">Roles You Match</p>
      <p className="text-2xl font-bold text-[#0047CC] leading-none mb-1.5">{summary.matchedRoleCount}</p>
      <button type="button" className="text-[11px] text-[#387DFF] font-bold cursor-pointer hover:text-[#0047CC] transition-colors">
        Go straight to interview
      </button>
    </div>
  </div>
);

export default RolesFoundStatsGrid;
