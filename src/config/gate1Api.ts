import { getActiveAssessmentId } from '../utils/assessmentSession';

export const isGate1ApiEnabled = (): boolean => true;

export const shouldMockGate1 = (_gate?: number): boolean => false;

export const isGate1MockSession = (_assessmentId: string): boolean => false;

export const resolveGate1AssessmentId = (): string | null => getActiveAssessmentId();

