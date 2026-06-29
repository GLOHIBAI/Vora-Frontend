import { getActiveAssessmentId } from '../utils/assessmentSession';
import { MOCK_GATE1_ASSESSMENT_ID } from '../mocks/gate1MockSession';

/** When false, Gate 1 uses in-memory mocks instead of assessment API calls. */
export const isGate1ApiEnabled = (): boolean =>
  import.meta.env.VITE_GATE1_API_ENABLED !== 'false';

export const shouldMockGate1 = (gate?: number): boolean =>
  !isGate1ApiEnabled() && (gate === undefined || gate === 1);

export const isGate1MockSession = (assessmentId: string): boolean =>
  !isGate1ApiEnabled() && !!assessmentId;

export const resolveGate1AssessmentId = (): string | null =>
  getActiveAssessmentId() ?? (!isGate1ApiEnabled() ? MOCK_GATE1_ASSESSMENT_ID : null);
