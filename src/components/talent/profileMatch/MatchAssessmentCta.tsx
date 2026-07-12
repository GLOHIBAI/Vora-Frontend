import Button from '../../common/Button';
import Tag from '../../common/Tag';
import { ChevronRightIcon } from '../../common/Icons';
import { SectionTitle } from '../../common/Typography';

interface MatchAssessmentCtaProps {
  pills: readonly string[];
  onStart?: () => void;
}

const tagClassName =
  '!bg-white !border-[#BDD9FF] !text-xs !font-medium !px-3.5 !py-1.5';

const MatchAssessmentCta: React.FC<MatchAssessmentCtaProps> = ({ pills, onStart }) => (
  <div className="bg-white border border-[#BDD9FF] rounded-[10px] px-5 py-6 sm:px-8 sm:py-7 mb-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
    <div className="flex-1 min-w-0">
      <SectionTitle as="h2" className="text-lg text-[#1A1A1A] mb-1.5">
        Ready to lock in your spot?
      </SectionTitle>
      <p className="text-[13px] font-normal text-[#4A4A4A] leading-relaxed mb-4">
        Complete the 3-part assessment and let your score do the talking. Takes 30,40 minutes.
      </p>
      <div className="flex flex-wrap gap-2">
        {pills.map((label) => (
          <Tag key={label} label={label} variant="outline" className={tagClassName} />
        ))}
      </div>
    </div>
    <Button
      type="button"
      variant="primary"
      size="sm"
      pill
      fullWidth={false}
      onClick={onStart}
      className="w-full lg:w-auto shrink-0"
    >
      Start interview
    </Button>
  </div>
);

export default MatchAssessmentCta;
