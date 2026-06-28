import { useEffect } from 'react';
import VoraLogo from '../../common/VoraLogo';
import Button from '../../common/Button';
import AssessmentItemsList from './AssessmentItemsList';
import { useAssessmentScreen } from '../../../hooks/useAssessmentScreen';
import { normalizeAssessmentItems } from '../../../utils/assessmentItems';
import type {
  AssessmentDraftResponse,
  AssessmentScreenStartResponse,
} from '../../../services/queries/assessments/types';

export interface AssessmentScreenProgress {
  label: string;
  percent: number;
}

export interface AssessmentScreenViewProps {
  assessmentId: string;
  screenData: AssessmentScreenStartResponse;
  draft?: AssessmentDraftResponse | null;
  /** e.g. "Stage 1 · How you think · Personality" */
  headerSubtitle: string;
  progress?: AssessmentScreenProgress;
  onSaveExit: () => void;
  onScreenComplete: () => void;
}

/**
 * Stage-agnostic assessment screen shell.
 * Consumes API items[] and delegates rendering to reusable item components.
 */
const AssessmentScreenView: React.FC<AssessmentScreenViewProps> = ({
  assessmentId,
  screenData,
  draft,
  headerSubtitle,
  progress,
  onSaveExit,
  onScreenComplete,
}) => {
  const {
    items,
    answers,
    recordAnswer,
    confirmScreen,
    isLocked,
    isSaving,
    isSubmitting,
    isScreenComplete,
    hydrateDraft,
  } = useAssessmentScreen({
    assessmentId,
    screenData,
    onScreenComplete,
  });

  useEffect(() => {
    if (draft?.responses) {
      hydrateDraft(
        draft.responses,
        draft.items?.length ? normalizeAssessmentItems(draft.items) : undefined,
      );
    }
  }, [draft, hydrateDraft]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col">
      <header className="bg-white px-6 py-3 flex items-center justify-between">
        <VoraLogo size="sm" to="/dashboard" />
        <div className="text-xs font-semibold text-[#808080]">{headerSubtitle}</div>
        <div className="text-xs text-[#0047CC] font-bold">
          {isSaving ? 'Saving…' : 'Auto-saved'}
        </div>
      </header>

      {progress ? (
        <div className="bg-white border-b border-[#E6E6E6] px-6 py-3">
          <div className="max-w-3xl mx-auto text-xs text-[#808080]">{progress.label}</div>
          <div className="max-w-3xl mx-auto mt-2 h-1.5 bg-[#E6E6E6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0047CC] transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
            />
          </div>
        </div>
      ) : null}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <AssessmentItemsList
          items={items}
          answers={answers}
          isLocked={isLocked}
          onAnswer={(itemId, val, item, subKey) => void recordAnswer(itemId, val, item, subKey)}
        />
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-[#E6E6E6] px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3 justify-between">
          <Button type="button" variant="secondary" onClick={onSaveExit}>
            Save and exit
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!isScreenComplete || isSubmitting}
            isLoading={isSubmitting}
            onClick={() => void confirmScreen()}
          >
            Continue
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AssessmentScreenView;
