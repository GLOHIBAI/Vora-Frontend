import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MATCH_ASSESSMENT_PILLS } from '../../../constants/profileMatchResult';
import { ChevronRightIcon } from '../../common/Icons';
import Button from '../../common/Button';

const MatchResultAssessmentCTA: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { roleSlug } = useParams<{ roleSlug: string }>();

  const handleAssessmentClick = () => {
    if (roleSlug) {
      navigate(`/onboarding/talent/${roleSlug}/assessment/asks`, { state: location.state });
    } else {
      // Fallback just in case
      navigate('/onboarding/talent/assessment/asks', { state: location.state });
    }
  };

  return (
    <>
      <div className="bg-white border border-[#387DFF] rounded-xl p-[20px] sm:px-[28px] sm:py-[26px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-5">
        <div className="flex-1">
          <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-1.5">
            Ready to lock in your spot?
          </h3>
          <p className="text-[13px] text-[#808080] leading-[1.5] mb-3.5">
            Complete the 3-part assessment and let your score do the talking. Takes 30 - 40 minutes.
          </p>
          <div className="flex flex-wrap gap-2">
            {MATCH_ASSESSMENT_PILLS.map((pill) => (
              <span
                key={pill}
                className="bg-white border border-[#387DFF] rounded-full px-[13px] py-[5px] text-[12px] font-medium text-[#0047CC]"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
        <Button 
          variant="primary" 
          size="md" 
          pill 
          fullWidth={false} 
          className="w-full sm:w-auto shrink-0 !px-6"
          onClick={handleAssessmentClick}
        >
          Start interview
        </Button>
    </div>

    <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 text-left">
      <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-1">
        One possible final step, and it is a great sign
      </h2>
      <p className="text-[13px] text-[#808080] leading-relaxed">
        Some employers add a brief <strong className="text-[#4A4A4A] font-medium">team alignment session</strong>{' '}
        (video or in-person) after assessment, a short conversation to check team culture fit and
        working style. Not every role has one. But if you are invited to one,{' '}
        <strong className="text-[#4A4A4A] font-medium">treat it as a near-certain offer</strong>. The technical
        screening is done; they are just deciding where to seat you.
      </p>
    </div>
  </>
  );
};

export default MatchResultAssessmentCTA;
