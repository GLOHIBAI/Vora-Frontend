import { useEffect, useRef, useState } from "react";
import {
  buildInitialProfileMatchStatuses,
  type ProfileMatchStepStatus,
} from "../constants/profileMatchBuilding";

const CV_PARSE_PROGRESS_CAP = 80;
const MATCH_PROGRESS_CAP = 97;
const PROGRESS_TICK_MS = 350;
const STEP_ADVANCE_MS = 2200;
const INITIAL_DELAY_MS = 800;

export interface UseProfileMatchProgressOptions {
  /** CV parse finished and role is ready for matching scan. */
  cvReadyForMatch?: boolean;
  /** CV parse failed freeze progress and stop step animation. */
  cvParseFailed?: boolean;
  /** Match API returned READY finish bar and steps. */
  matchReady?: boolean;
}

const STEP_HEADLINES: Record<number, string> = {
  0: "Reading and parsing your CV…",
  1: "Reading and parsing your CV…",
  2: "Checking work eligibility against this role…",
  3: "Matching your profile against eligible roles…",
  4: "Calculating Career Readiness Score…",
  5: "Scanning all live roles for additional matches…",
};

export const useProfileMatchProgress = ({
  cvReadyForMatch = false,
  cvParseFailed = false,
  matchReady = false,
}: UseProfileMatchProgressOptions = {}) => {
  const [statuses, setStatuses] = useState<ProfileMatchStepStatus[]>(
    buildInitialProfileMatchStatuses,
  );
  const [headline, setHeadline] = useState("Checking work eligibility against this role…");
  const [progress, setProgress] = useState(40);

  const matchPhaseStarted = cvReadyForMatch || matchReady;

  // Creep progress bar: cap at 80% until CV ready, then up to 97% while match poll runs.
  useEffect(() => {
    if (cvParseFailed) return;

    const cap = matchPhaseStarted ? MATCH_PROGRESS_CAP : CV_PARSE_PROGRESS_CAP;
    if (progress >= cap && !matchReady) return;

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        const targetCap = matchPhaseStarted
          ? MATCH_PROGRESS_CAP
          : CV_PARSE_PROGRESS_CAP;
        if (prev >= targetCap) return prev;
        return Math.min(prev + 1, targetCap);
      });
    }, PROGRESS_TICK_MS);

    return () => clearInterval(intervalId);
  }, [cvParseFailed, matchPhaseStarted]);

  // When match result is ready from backend, finish bar and mark all steps done.
  useEffect(() => {
    if (matchReady) {
      setProgress(MATCH_PROGRESS_CAP);
      setHeadline("Match complete! Preparing your results…");
      setStatuses(["done", "done", "done", "done", "done", "done"]);
    }
  }, [matchReady]);

  // Advance checklist steps strictly in order (1 -> 2 -> 3 -> 4 -> 5 -> 6).
  useEffect(() => {
    if (cvParseFailed || matchReady) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const advanceStep = () => {
      if (cvParseFailed || matchReady) return;

      setStatuses((prev) => {
        const runningIndex = prev.findIndex((status) => status === "running");

        // If no step is running currently, don't do anything
        if (runningIndex === -1) return prev;

        // If step 4 (score) is running and CV match phase hasn't unlocked yet, pause before step 5 (scanning)
        if (runningIndex === 4 && !matchPhaseStarted) {
          setHeadline("Finishing CV analysis…");
          return prev;
        }

        const next = [...prev];
        next[runningIndex] = "done";

        const nextIndex = runningIndex + 1;
        if (nextIndex < next.length) {
          next[nextIndex] = "running";
          setHeadline(STEP_HEADLINES[nextIndex] || "Processing…");
          timeoutId = setTimeout(advanceStep, STEP_ADVANCE_MS);
        }

        return next;
      });
    };

    timeoutId = setTimeout(advanceStep, INITIAL_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [cvParseFailed, matchPhaseStarted, matchReady]);

  // If cvReadyForMatch becomes true while paused at step 4 (score), trigger advanceStep immediately
  const cvReadyTriggeredRef = useRef(false);
  useEffect(() => {
    if (!cvReadyForMatch || cvReadyTriggeredRef.current || cvParseFailed || matchReady)
      return;

    cvReadyTriggeredRef.current = true;
    setProgress((prev) => Math.max(prev, CV_PARSE_PROGRESS_CAP));
  }, [cvReadyForMatch, cvParseFailed, matchReady]);

  useEffect(() => {
    if (cvParseFailed) {
      setHeadline("CV parsing failed");
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
