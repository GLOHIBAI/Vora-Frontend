import { useEffect, useRef, useState } from 'react';
import {
  buildInitialProfileMatchStatuses,
  type ProfileMatchStepStatus,
} from '../constants/profileMatchBuilding';

const CV_PARSE_PROGRESS_CAP = 80;
const MATCH_PROGRESS_CAP = 100;
const PROGRESS_TICK_MS = 350;
const STEP_ADVANCE_MS = 2200;
const INITIAL_DELAY_MS = 800;

export interface UseProfileMatchProgressOptions {
  /** CV parse finished and role is ready for matching scan. */
  cvReadyForMatch?: boolean;
  /** CV parse failed — freeze progress and stop step animation. */
  cvParseFailed?: boolean;
  /** Match API returned READY — finish bar and steps. */
  matchReady?: boolean;
}

export const useProfileMatchProgress = ({
  cvReadyForMatch = false,
  cvParseFailed = false,
  matchReady = false,
}: UseProfileMatchProgressOptions = {}) => {
  const [statuses, setStatuses] = useState<ProfileMatchStepStatus[]>(buildInitialProfileMatchStatuses);
  const [headline, setHeadline] = useState('Reading and parsing your CV…');
  const [progress, setProgress] = useState(40);

  const matchPhaseStarted = cvReadyForMatch || matchReady;

  // Creep progress: cap at 80% until CV ready, then up to 100% while match poll runs.
  useEffect(() => {
    if (cvParseFailed) return;

    const cap = matchPhaseStarted ? MATCH_PROGRESS_CAP : CV_PARSE_PROGRESS_CAP;
    if (progress >= cap && !matchReady) return;

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        const targetCap = matchPhaseStarted ? MATCH_PROGRESS_CAP : CV_PARSE_PROGRESS_CAP;
        if (prev >= targetCap) return prev;
        return Math.min(prev + 1, targetCap);
      });
    }, PROGRESS_TICK_MS);

    return () => clearInterval(intervalId);
  }, [cvParseFailed, matchPhaseStarted]);

  // Jump to 100 when match result is ready.
  useEffect(() => {
    if (matchReady) {
      setProgress(MATCH_PROGRESS_CAP);
      setHeadline('Match complete! Preparing your results…');
      setStatuses(['done', 'done', 'done', 'done', 'done', 'done']);
    }
  }, [matchReady]);

  // Advance checklist steps during CV parse (pause last steps until cvReadyForMatch).
  useEffect(() => {
    if (cvParseFailed || matchReady) return;

    let stepIndex = 2;
    let timeoutId: ReturnType<typeof setTimeout>;
    const stepCount = buildInitialProfileMatchStatuses().length;
    const cvPhaseLastStep = 4; // index 4 = 5th step — stop before final step until match phase

    const advance = () => {
      if (cvParseFailed) return;

      if (!matchPhaseStarted && stepIndex >= cvPhaseLastStep) {
        setHeadline('Finishing CV analysis…');
        return;
      }

      setStatuses((prev) => {
        const next = [...prev];
        next[stepIndex] = 'done';
        if (stepIndex + 1 < next.length) {
          next[stepIndex + 1] = 'running';
        }
        return next;
      });

      if (stepIndex === 2) setHeadline('Matching your profile against eligible roles…');
      if (stepIndex === 3) setHeadline('Scanning all live roles for additional matches…');

      stepIndex += 1;

      if (!matchPhaseStarted && stepIndex >= cvPhaseLastStep) {
        return;
      }

      if (stepIndex >= stepCount) {
        setHeadline('Calculating your match score…');
        return;
      }

      timeoutId = setTimeout(advance, STEP_ADVANCE_MS);
    };

    timeoutId = setTimeout(advance, INITIAL_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [cvParseFailed, matchPhaseStarted, matchReady]);

  // When CV parse completes, unlock match-phase steps and headline.
  const matchPhaseStartedRef = useRef(false);
  useEffect(() => {
    if (!cvReadyForMatch || matchPhaseStartedRef.current || cvParseFailed) return;
    matchPhaseStartedRef.current = true;
    setProgress((prev) => Math.max(prev, CV_PARSE_PROGRESS_CAP));
    setHeadline('CV ready — checking work eligibility…');
    setStatuses((prev) => {
      const next = [...prev];
      next[4] = 'done';
      if (next[5] !== 'done') next[5] = 'running';
      return next;
    });
  }, [cvReadyForMatch, cvParseFailed]);

  useEffect(() => {
    if (cvParseFailed) {
      setHeadline('CV parsing failed');
    }
  }, [cvParseFailed]);

  const isComplete = matchReady && progress >= MATCH_PROGRESS_CAP;

  return {
    statuses,
    progress,
    headline,
    isComplete,
    cvParseProgressCap: CV_PARSE_PROGRESS_CAP,
  };
};
