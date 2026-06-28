import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import Button from '../../components/common/Button';
import { useReviewSummaryQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { parseReviewSummaryEntries } from '../../utils/assessmentSession';

const RoleAssessmentGate1Review: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() ?? '';

  const { data: reviewRaw, isLoading } = useReviewSummaryQuery(assessmentId, 1, {
    enabled: !!assessmentId,
  });
  const entries = parseReviewSummaryEntries(reviewRaw);

  const handleContinue = () => {
    navigate(`/onboarding/talent/${roleSlug}/assessment/gate-1/verdict`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans">
      <header className="bg-white border-b border-[#E6E6E6] px-6 py-3">
        <VoraLogo size="sm" to="/dashboard" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Review session 2 answers</h1>
        <p className="text-sm text-[#808080] mb-8">
          Read-only summary before we score Stage 1. You cannot change answers here.
        </p>

        {isLoading ? (
          <p className="text-sm text-[#808080]">Loading review…</p>
        ) : (
          <div className="space-y-4 mb-8">
            {entries.length === 0 ? (
              <p className="text-sm text-[#808080]">No review entries returned yet.</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.componentId} className="bg-white border border-[#E6E6E6] rounded-xl p-5">
                  <p className="text-xs font-bold text-[#0047CC] uppercase mb-1">{entry.screenKey}</p>
                  <h2 className="text-lg font-semibold mb-2">{entry.title}</h2>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed">{entry.summary}</p>
                </div>
              ))
            )}
          </div>
        )}

        <Button type="button" variant="primary" onClick={handleContinue} disabled={isLoading}>
          Continue to results
        </Button>
      </main>
    </div>
  );
};

export default RoleAssessmentGate1Review;
