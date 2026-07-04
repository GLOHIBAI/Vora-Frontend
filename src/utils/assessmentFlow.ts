import type {
  AssessmentItem,
  ResponsesMap,
} from "../services/queries/assessments/types";
import { isAdaptiveType } from "../services/queries/assessments/types";
import {
  GATE1_SESSION1_SCREENS,
  GATE1_SESSION2_SCREENS,
  type Gate1ScreenKey,
  type GateResumeState,
} from "../services/queries/assessments/types";

/** Session 1 six separate POST start / POST submit cycles. */
export const GATE1_SESSION1_FLOW: readonly Gate1ScreenKey[] =
  GATE1_SESSION1_SCREENS;

/** Session 2 five separate POST start / POST submit cycles. */
export const GATE1_SESSION2_FLOW: readonly Gate1ScreenKey[] =
  GATE1_SESSION2_SCREENS;

/** Gate 1 has 11 scored parts across Session 1 (6 screens) + Session 2 (5 screens). */
export const GATE1_TOTAL_PARTS = 11;

/** Full journey order enforced by the backend (gate-1-journey). Never POST start with other keys. */
export const GATE1_JOURNEY_SCREENS = [
  ...GATE1_SESSION1_SCREENS,
  ...GATE1_SESSION2_SCREENS,
] as const satisfies readonly Gate1ScreenKey[];

export const GATE1_FINAL_SCREEN: Gate1ScreenKey =
  GATE1_SESSION2_SCREENS[GATE1_SESSION2_SCREENS.length - 1];

/** 400 responses from POST .../gates/1/start that usually mean stale resume-state. */
export const isRecoverableGate1StartError = (message: string): boolean =>
  /is not available yet/i.test(message) ||
  /has already been submitted/i.test(message) ||
  /finish or submit the in-progress screen/i.test(message) ||
  /before starting another/i.test(message);

export const isGate1JourneyScreenKey = (
  screenKey: string,
): screenKey is Gate1ScreenKey =>
  (GATE1_JOURNEY_SCREENS as readonly string[]).includes(screenKey);

export interface Gate1PostSubmitRoute {
  type: "reload" | "session1_complete" | "review";
}

/**
 * After POST .../components/:id/submit (no nextScreenKey in response),
 * refetch resume-state and decide where to go next.
 */
export const resolveGate1PostSubmitRoute = (
  finishedScreenKey: Gate1ScreenKey,
  resume: GateResumeState,
): Gate1PostSubmitRoute => {
  if (resume.gate1Complete) {
    return { type: "review" };
  }

  const finishedSession1 =
    finishedScreenKey ===
    GATE1_SESSION1_SCREENS[GATE1_SESSION1_SCREENS.length - 1];

  if (finishedSession1 && resume.session === 2) {
    return { type: "session1_complete" };
  }

  return { type: "reload" };
};

/** Body for POST /assessments/:id/gates/1/start one screen per request. */
export const buildGate1StartBody = (
  screenKey: Gate1ScreenKey,
): { screen: Gate1ScreenKey } => ({
  screen: screenKey,
});

/** Build the submit payload one entry per item.id on the current screen. */
export const buildScreenSubmitResponses = (
  items: AssessmentItem[],
  answers: ResponsesMap,
): ResponsesMap => {
  const payload: ResponsesMap = {};
  items.forEach((item) => {
    if (isAdaptiveType(item.type) && item.content.layout !== "multi_question")
      return;
    const value = answers[item.id];
    if (value !== undefined && value !== null && value !== "") {
      payload[item.id] = value;
    }
  });
  return payload;
};
