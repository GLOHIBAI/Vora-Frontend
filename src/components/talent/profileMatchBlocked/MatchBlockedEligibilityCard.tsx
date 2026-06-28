import { ShieldIcon, XCircleIcon } from '../../common/Icons';
import Button from '../../common/Button';

interface MatchBlockedEligibilityCardProps {
  score: number;
  headline: string;
  body: string;
  reasons: { key: string; value: string }[];
}

const MatchBlockedEligibilityCard: React.FC<MatchBlockedEligibilityCardProps> = ({
  score,
  headline,
  body,
  reasons,
}) => (
  <div className="bg-white border border-[#E6E6E6] rounded-[10px] overflow-hidden mb-[18px]">
    <div className="bg-white border-b border-[#E6E6E6] p-6 pb-5 flex flex-col sm:flex-row gap-4 items-start">
      <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-[#FECACA] flex items-center justify-center shrink-0">
        <ShieldIcon size={24} strokeWidth={2.5} className="text-[#DC2626]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight mb-1.5">{headline}</h2>
        {body ? (
          <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
        ) : null}
      </div>
    </div>

    <div className="p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#F7F7F7] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[18px] sm:px-[22px] mb-[18px]">
        <div className="text-center sm:text-left shrink-0">
          <div className="text-4xl font-extrabold text-[#991B1B] leading-none">{score}%</div>
          <div className="text-[13px] font-bold text-[#1A1A1A] mt-1">Estimated profile fit</div>
        </div>
      </div>

      <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-lg p-4 sm:px-5 mb-[18px]">
        <div className="text-sm font-bold text-[#1A1A1A] mb-2.5 flex items-center gap-2">
          <XCircleIcon size={14} strokeWidth={2.5} className="shrink-0 text-[#DC2626]" />
          Why this role is not available to you right now
        </div>
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-2 border-b border-[#E6E6E6] text-[13px] last:border-b-0 gap-1 sm:gap-4"
          >
            <span className="text-gray-600 font-medium shrink-0">{reason.key}</span>
            <span
              className={`font-medium sm:text-right ${reason.key === 'Result' ? 'text-[#DC2626] text-[14px] font-bold' : 'text-[#1A1A1A]'}`}
            >
              {reason.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E6E6E6] rounded-[10px] p-5 sm:px-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 text-center sm:text-left">
          <div className="text-sm font-medium text-[#1A1A1A] mb-1">Did we get your work rights wrong?</div>
          <div className="text-[13px] text-[#808080] leading-relaxed">
            Update your onboarding profile and VORA will re-run the eligibility check immediately.
          </div>
        </div>
        <Button variant="primary" fullWidth={false} className="shrink-0 whitespace-nowrap">
          Update my work rights
        </Button>
      </div>
    </div>
  </div>
);

export default MatchBlockedEligibilityCard;
