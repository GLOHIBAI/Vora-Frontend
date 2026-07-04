import { getActiveAssessmentId } from '../utils/assessmentSession';
import { MOCK_GATE1_ASSESSMENT_ID } from '../mocks/gate1MockSession';

export const isGate1ApiEnabled = (): boolean => true;

export const shouldMockGate1 = (gate?: number): boolean =>
  !isGate1ApiEnabled() && (gate === undefined || gate === 1);

export const isGate1MockSession = (assessmentId: string): boolean =>
  !isGate1ApiEnabled() && !!assessmentId;

export const resolveGate1AssessmentId = (): string | null =>
  getActiveAssessmentId() ?? (!isGate1ApiEnabled() ? MOCK_GATE1_ASSESSMENT_ID : null);
