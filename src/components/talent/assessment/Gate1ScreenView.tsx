import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../common/Button';
import FullPageSpinner from '../../common/FullPageSpinner';
import AssessmentScreenView from './AssessmentScreenView';
import {
  useGate1ActiveScreen,
  useGate1ScreenDraft,
} from '../../../hooks/useGate1ActiveScreen';
import { useGate1PostSubmitNavigation } from '../../../hooks/useGate1PostSubmitNavigation';
import { useGetPublicRoleQuery } from '../../../services/queries/talent';
import { GATE1_SCREEN_LABELS, unwrapAssessmentData } from '../../../utils/assessmentSession';
import { GATE1_TOTAL_PARTS } from '../../../utils/assessmentFlow';
import type { Gate1ScreenKey } from '../../../services/queries/assessments/types';
import type { AssessmentDraftResponse } from '../../../services/queries/assessments/types';

/**
 * Gate 1 active screen one API screen per visit.
 *
 * Flow per screen:
 *   1. Initial boot: GET resume-state -> nextScreenKey -> POST gates/1/start { screen }
 *   2. PATCH .../responses (draft answers)
 *   3. POST .../submit { responses } -> returns nextScreen.nextScreenKey
 *   4. Direct advance: POST gates/1/start { screen: nextScreenKey } (no intermediate resume-state)
 *   5. Last screen (11th / values_tradeoff): navigate directly to review -> gate submit -> verdict
 */
const Gate1ScreenView: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const { data: roleResponse } = useGetPublicRoleQuery(roleSlug || '');
  const roleData = roleResponse?.data || roleResponse;
  const companyName = roleData?.companyName || 'Reach Africa';
  const roleTitle = roleData?.roleTitle || 'Senior Programme Officer';

  const {
    assessmentId,
    resumeState,
    screenData,
    isLoading,
    isGenerating,
    error,
    isRecoverableError,
    reloadAfterSubmit,
    refetchResumeState,
    advanceToNextScreen,
  } = useGate1ActiveScreen();

  const { data: draftRaw } = useGate1ScreenDraft(assessmentId, screenData);
  const draft = unwrapAssessmentData<AssessmentDraftResponse>(draftRaw);

  const handleScreenComplete = useGate1PostSubmitNavigation({
    roleSlug,
    assessmentId,
    finishedScreenKey: (screenData?.screenKey ?? '') as Gate1ScreenKey,
    refetchResumeState,
    reloadAfterSubmit,
    advanceToNextScreen,
  });

  useEffect(() => {
    if (!resumeState?.gate1Complete || !roleSlug) return;
    navigate(`/onboarding/talent/${roleSlug}/interview/gate-1/review`, { replace: true });
  }, [resumeState?.gate1Complete, roleSlug, navigate]);

  const renderStartError = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-4">
        <p className="text-[#808080]">{error}</p>
        {isRecoverableError && (
          <p className="text-sm text-[#808080]">
            Your progress may be out of sync. We&apos;ll reload the next screen from the server.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="primary" onClick={() => reloadAfterSubmit()}>
            {isRecoverableError ? 'Sync progress' : 'Try again'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/onboarding/talent/${roleSlug}/interview/journey`)}
          >
            Back to journey
          </Button>
        </div>
      </div>
    </div>
  );

  if (!assessmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-[#808080] mb-4">{error ?? 'No active interview found.'}</p>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(`/onboarding/talent/${roleSlug}/interview/journey`)}
          >
            Back to journey
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !screenData || !resumeState) {
    if (error) {
      return renderStartError();
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <FullPageSpinner
          isFullPage={false}
          message={isGenerating ? "Generating questions, please wait…" : "Loading your interview screen…"}
        />
      </div>
    );
  }

  if (error) {
    return renderStartError();
  }

  const screenKey = screenData.screenKey as Gate1ScreenKey;
  const screenLabel = GATE1_SCREEN_LABELS[screenKey] ?? screenKey;
  const sessionScreens =
    resumeState.session === 1 ? resumeState.session1Screens : resumeState.session2Screens;
  const screenIndex = (sessionScreens as readonly string[]).indexOf(screenKey);

  const sessionOffset = resumeState.session === 2 ? 6 : 0;
  const currentStep = screenIndex >= 0 ? sessionOffset + screenIndex : 0;
  const partsCompleted = Math.max(resumeState.completedScreenKeys.length, currentStep);
  const partsRequired = GATE1_TOTAL_PARTS;

  return (
    <AssessmentScreenView
      assessmentId={assessmentId}
      screenData={screenData}
      draft={draft}
      headerSubtitle={`Stage 1 · ${resumeState.sessionLabel} · ${screenLabel}`}
      session={resumeState.session}
      sessionScreens={sessionScreens as readonly string[]}
      screenIndex={screenIndex}
      screenLabel={screenLabel}
      companyName={companyName}
      roleTitle={roleTitle}
      progress={{
        label: `Session ${resumeState.session} · Screen ${Math.max(screenIndex + 1, 1)} of ${sessionScreens.length} · ${partsCompleted} of ${partsRequired} parts complete`,
        percent: Math.round((partsCompleted / partsRequired) * 100),
      }}
      onSaveExit={() => navigate(`/onboarding/talent/${roleSlug}/interview/journey`)}
      onScreenComplete={handleScreenComplete}
    />
  );
};

export default Gate1ScreenView;
