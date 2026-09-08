import { ShieldIcon } from '../../common/Icons';

const MatchEligibilityBanner: React.FC = () => (
  <div className="bg-[#EEFBEE] border border-[#85E585] rounded-[10px] px-[18px] py-3.5 mb-5 flex gap-2.5 items-start">
    <ShieldIcon size={16} strokeWidth={2.5} className="text-[#2CA62C] shrink-0 mt-0.5" />
    <div>
      <p className="text-[13px] font-extrabold text-[#135813] mb-1">
        ✓ Work authorisation confirmed, you qualify to work in this role
      </p>
      <p className="text-[13px] text-[#1D871D] leading-relaxed">
        VORA verified your nationality, country of residence, and right-to-work status against this
        role&apos;s requirements. You are fully cleared to proceed to interview.
      </p>
    </div>
  </div>
);

export default MatchEligibilityBanner;
