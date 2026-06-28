import { CheckCircleIcon, ShieldIcon } from '../../common/Icons';
import type { ProfileWaitlistSummary } from '../../../types/profileMatchWaitlist';

interface ProfileWaitlistHeroProps {
  summary: ProfileWaitlistSummary;
}

const ProfileWaitlistHero: React.FC<ProfileWaitlistHeroProps> = ({ summary }) => (
  <div className="bg-white border border-[#E6E6E6] rounded-[10px] px-5 sm:px-9 py-6 sm:py-9 text-center mb-[18px]">
    <div className="w-[68px] h-[68px] rounded-full bg-white border-2 border-[#387DFF] flex items-center justify-center mx-auto mb-5">
      <CheckCircleIcon size={28} strokeWidth={2.5} className="text-[#0047CC]" />
    </div>

    {summary.explanationSummary ? (
      <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight mb-2.5 leading-relaxed max-w-[660px] mx-auto">
        {summary.explanationSummary}
      </h2>
    ) : (
      <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight mb-2.5">
        No live roles matched your profile at {summary.matchThreshold}% or above right now.
      </h2>
    )}

    <p className="text-sm text-[#808080] leading-relaxed max-w-[660px] mx-auto mb-5 sm:mb-[22px]">
      Your profile stays on file. When a role opens that clears the {summary.matchThreshold}% threshold,
      VORA will notify you and you can go straight to assessment.
    </p>

    <div className="inline-flex items-start gap-2.5 bg-white border border-[#E6E6E6] rounded-lg px-5 py-3 text-left mb-5 sm:mb-[22px]">
      <ShieldIcon size={18} strokeWidth={2.5} className="text-[#0047CC] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-[#1A1A1A]">Strong profile detected</p>
        <p className="text-xs text-gray-600 mt-0.5">{summary.strongProfileNote}</p>
      </div>
    </div>

    <div className="flex flex-wrap justify-center gap-3.5">
      <div className="text-center bg-[#F7F7F7] border border-[#E6E6E6] rounded-lg px-5 py-3.5 min-w-[110px]">
        <p className="text-[22px] font-extrabold text-[#0047CC]">{summary.careerReadinessScore}%</p>
        <p className="text-xs text-[#808080] font-semibold mt-0.5">Career Readiness</p>
      </div>
      <div className="text-center bg-[#F7F7F7] border border-[#E6E6E6] rounded-lg px-5 py-3.5 min-w-[110px]">
        <p className="text-[22px] font-extrabold text-[#0047CC]">{summary.assessmentGrade}</p>
        <p className="text-xs text-[#808080] font-semibold mt-0.5">Assessment Grade</p>
      </div>
      <div className="text-center bg-[#F7F7F7] border border-[#E6E6E6] rounded-lg px-5 py-3.5 min-w-[110px]">
        <p className="text-[22px] font-extrabold text-[#0047CC]">{summary.profileStrengthLabel}</p>
        <p className="text-xs text-[#808080] font-semibold mt-0.5">Profile strength</p>
      </div>
    </div>
  </div>
);

export default ProfileWaitlistHero;
