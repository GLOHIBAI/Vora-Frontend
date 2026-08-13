import type {
  AssessmentItem,
  Gate2PillarKey,
  Gate2ResumeNextStep,
  Gate2ResumeState,
  GateWindowInfo,
  ResponsesMap,
} from "../services/queries/assessments/types";
import { GATE2_PILLARS } from "../services/queries/assessments/types";
import { formatSecondsAsHms, unwrapAssessmentData } from "./assessmentSession";

const GATE2_NEXT_STEPS: Gate2ResumeNextStep[] = [
  "PILLAR_INTRO",
  "START_PILLAR",
  "RESUME_PILLAR",
  "GATE2_COMPLETE",
];

const isGate2PillarKey = (value: unknown): value is Gate2PillarKey =>
  typeof value === "string" &&
  (GATE2_PILLARS as readonly string[]).includes(value);

export const resolveGate2PillarKey = (
  value: unknown,
): Gate2PillarKey | null => {
  if (!isGate2PillarKey(value)) return null;
  return value;
};

/** Intro route for a Gate 2 pillar. */
export const gate2PillarIntroPath = (
  roleSlug: string,
  pillar: Gate2PillarKey | string | null | undefined,
): string | null => {
  const key = resolveGate2PillarKey(pillar);
  if (!key) return null;
  const part =
    key === "expertise"
      ? 2
      : key === "reasoning"
        ? 3
        : key === "simulation"
          ? 4
          : 1;
  return `/onboarding/talent/${roleSlug}/interview/stage-2/part-${part}/intro`;
};

/** First answering surface for a Gate 2 pillar (POST start happens on mount). */
export const gate2PillarStartPath = (
  roleSlug: string,
  pillar: Gate2PillarKey | string | null | undefined,
): string | null => {
  const key = resolveGate2PillarKey(pillar);
  if (!key) return null;
  if (key === "expertise") {
    return `/onboarding/talent/${roleSlug}/interview/stage-2/part-2/interview-1`;
  }
  if (key === "reasoning") {
    return `/onboarding/talent/${roleSlug}/interview/stage-2/part-3/interview-1`;
  }
  if (key === "simulation") {
    return `/onboarding/talent/${roleSlug}/interview/stage-2/part-4/simulation-1`;
  }
  return `/onboarding/talent/${roleSlug}/interview/stage-2/part-1/interview-1`;
};

/**
 * Where Resume should navigate based on resume-state nextStep.
 * start/regen still run on the destination page via POST .../gates/2/start.
 */
export const resolveGate2ResumeNavigatePath = (
  roleSlug: string,
  resume: Gate2ResumeState,
): string => {
  if (resume.nextStep === "GATE2_COMPLETE" || resume.gate2Complete) {
    // All pillars done — go to review so the user can POST gates/2/submit.
    // /analyzing must only be reached after that final submit.
    return `/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`;
  }

  const pillar = resume.nextPillar ?? resume.pillar;

  if (resume.nextStep === "PILLAR_INTRO" || resume.nextStep === "START_PILLAR") {
    return (
      gate2PillarIntroPath(roleSlug, pillar) ||
      `/onboarding/talent/${roleSlug}/interview/stage-2`
    );
  }

  // RESUME_PILLAR — go straight into answering; page POSTs start for regen/continue.
  return (
    gate2PillarStartPath(roleSlug, pillar) ||
    `/onboarding/talent/${roleSlug}/interview/stage-2`
  );
};

export const parseGate2ResumeState = (
  response: unknown,
): Gate2ResumeState | null => {
  const unwrapped = unwrapAssessmentData<Record<string, unknown>>(response);
  if (!unwrapped || typeof unwrapped !== "object") return null;

  const nextStepRaw = String(unwrapped.nextStep ?? unwrapped.next_step ?? "");
  if (!GATE2_NEXT_STEPS.includes(nextStepRaw as Gate2ResumeNextStep)) {
    return null;
  }
  const nextStep = nextStepRaw as Gate2ResumeNextStep;

  const completedRaw = unwrapped.completedPillars ?? unwrapped.completed_pillars;
  const completedPillars = Array.isArray(completedRaw)
    ? completedRaw.map(String)
    : [];

  const pillarsRaw = unwrapped.pillars;
  const pillars = Array.isArray(pillarsRaw)
    ? pillarsRaw.map(String)
    : [...GATE2_PILLARS];

  const windowRaw = unwrapped.window;
  let window: GateWindowInfo | null = null;
  if (windowRaw && typeof windowRaw === "object") {
    const w = windowRaw as Record<string, unknown>;
    window = {
      from: Number(w.from ?? 1),
      through: Number(w.through ?? 4),
      hasMore: Boolean(w.hasMore ?? w.has_more ?? false),
    };
  }

  const interviewRaw = unwrapped.interview;
  let interview: Gate2ResumeState["interview"] = null;
  if (interviewRaw && typeof interviewRaw === "object") {
    const i = interviewRaw as Record<string, unknown>;
    interview = {
      index: Number(i.index ?? 1),
      total: Number(i.total ?? 1),
    };
  }

  const timersRaw = unwrapped.timers;
  let timers: Gate2ResumeState["timers"] = null;
  if (timersRaw && typeof timersRaw === "object") {
    const t = timersRaw as Record<string, unknown>;
    timers = {
      gateLimitSecs:
        t.gateLimitSecs != null
          ? Number(t.gateLimitSecs)
          : t.gate_limit_secs != null
            ? Number(t.gate_limit_secs)
            : undefined,
      interviewLimitSecs:
        t.interviewLimitSecs != null
          ? Number(t.interviewLimitSecs)
          : t.interview_limit_secs != null
            ? Number(t.interview_limit_secs)
            : undefined,
    };
  }

  const progressRaw = unwrapped.progress;
  let progress: Gate2ResumeState["progress"] = null;
  if (progressRaw && typeof progressRaw === "object") {
    const p = progressRaw as Record<string, unknown>;
    progress = {
      current: p.current != null ? Number(p.current) : undefined,
      total: p.total != null ? Number(p.total) : undefined,
      answered: p.answered != null ? Number(p.answered) : undefined,
    };
  }

  const inProgressRaw = unwrapped.inProgress ?? unwrapped.in_progress;
  let inProgress: Gate2ResumeState["inProgress"] = null;
  if (inProgressRaw && typeof inProgressRaw === "object") {
    const row = inProgressRaw as Record<string, unknown>;
    inProgress = {
      pillar: row.pillar != null ? String(row.pillar) : undefined,
      componentId:
        row.componentId != null
          ? String(row.componentId)
          : row.component_id != null
            ? String(row.component_id)
            : undefined,
      part: row.part != null ? Number(row.part) : undefined,
    };
  }

  const nextCallsRaw = unwrapped.nextCalls ?? unwrapped.next_calls;
  let nextCalls: Gate2ResumeState["nextCalls"] = null;
  if (nextCallsRaw && typeof nextCallsRaw === "object") {
    nextCalls = nextCallsRaw as Gate2ResumeState["nextCalls"];
  }

  const items = Array.isArray(unwrapped.items)
    ? (unwrapped.items as AssessmentItem[])
    : [];

  const responses =
    unwrapped.responses &&
    typeof unwrapped.responses === "object" &&
    !Array.isArray(unwrapped.responses)
      ? (unwrapped.responses as ResponsesMap)
      : {};

  const nextPillarRaw = unwrapped.nextPillar ?? unwrapped.next_pillar;
  const pillarRaw = unwrapped.pillar;

  return {
    schemaVersion:
      unwrapped.schemaVersion != null
        ? Number(unwrapped.schemaVersion)
        : undefined,
    assessmentId:
      unwrapped.assessmentId != null
        ? String(unwrapped.assessmentId)
        : undefined,
    gate: 2,
    gateName:
      unwrapped.gateName != null ? String(unwrapped.gateName) : undefined,
    nextPillar:
      nextPillarRaw === null || nextPillarRaw === undefined
        ? null
        : String(nextPillarRaw),
    pillarLabel:
      unwrapped.pillarLabel != null ? String(unwrapped.pillarLabel) : null,
    part: unwrapped.part != null ? Number(unwrapped.part) : null,
    partLabel: unwrapped.partLabel != null ? String(unwrapped.partLabel) : null,
    pillarIntroTitle:
      unwrapped.pillarIntroTitle != null
        ? String(unwrapped.pillarIntroTitle)
        : null,
    screenTitle:
      unwrapped.screenTitle != null ? String(unwrapped.screenTitle) : null,
    completedPillars,
    pillars,
    gate2Complete: Boolean(
      unwrapped.gate2Complete ?? unwrapped.gate2_complete ?? false,
    ),
    contentReady:
      unwrapped.contentReady != null
        ? Boolean(unwrapped.contentReady)
        : unwrapped.content_ready != null
          ? Boolean(unwrapped.content_ready)
          : true,
    nextStep,
    componentId:
      unwrapped.componentId != null
        ? String(unwrapped.componentId)
        : unwrapped.component_id != null
          ? String(unwrapped.component_id)
          : null,
    pillar:
      pillarRaw === null || pillarRaw === undefined ? null : String(pillarRaw),
    items,
    responses,
    progress,
    window,
    interview,
    timers,
    inProgress,
    nextCalls,
    pausedAt: unwrapped.pausedAt != null ? String(unwrapped.pausedAt) : undefined,
  };
};

export interface Gate2ResumeViewModel {
  welcomeText: string;
  pausedTimeText: string;
  positionTitle: string;
  positionDesc: string;
  crumbs: string[];
  deadlineLabel: string;
  deadlineRemainingSeconds: number | null;
  deadlineTotalFormatted: string;
  deadlineHint: string;
  interviewTimerLabel: string;
  interviewTimerValue: string;
  completedLabel: string;
  completedValue: string;
  completedSub: string;
  resumePath: string;
  showRegenerationNotice: boolean;
  nextStep: Gate2ResumeNextStep;
  leaveOffReady: boolean;
}

const firstItemCopy = (resume: Gate2ResumeState) => {
  const item = resume.items?.[0] as
    | (AssessmentItem & {
        subtitle?: string;
        screenSubtitle?: string;
        screenTitle?: string;
        timerSecs?: number;
        content?: Record<string, unknown>;
      })
    | undefined;
  if (!item) return { title: "", subtitle: "", timerSecs: undefined as number | undefined };
  const content = item.content ?? {};
  return {
    title: String(
      item.screenTitle || item.title || content.briefTitle || "",
    ),
    subtitle: String(
      item.subtitle ||
        item.screenSubtitle ||
        content.briefBody ||
        content.whyThisMatters ||
        "",
    ),
    timerSecs:
      typeof item.timerSecs === "number" && item.timerSecs > 0
        ? item.timerSecs
        : undefined,
  };
};

export const buildGate2ResumeViewModel = (
  resume: Gate2ResumeState,
  roleSlug: string,
): Gate2ResumeViewModel => {
  const partLabel = String(resume.partLabel || "").trim();
  const pillarLabel = String(resume.pillarLabel || "").trim();
  const itemCopy = firstItemCopy(resume);

  const interviewIndex = resume.interview?.index;
  const interviewTotal = resume.interview?.total;
  const interviewCrumb =
    interviewIndex != null && interviewTotal != null
      ? `Interview ${interviewIndex} of ${interviewTotal}`
      : "";

  const completedCount = resume.completedPillars.length;
  const totalParts = resume.pillars.length;

  const gateSecs =
    resume.timers?.gateLimitSecs != null && resume.timers.gateLimitSecs > 0
      ? resume.timers.gateLimitSecs
      : null;
  const interviewSecs =
    (resume.timers?.interviewLimitSecs != null &&
    resume.timers.interviewLimitSecs > 0
      ? resume.timers.interviewLimitSecs
      : null) ?? itemCopy.timerSecs ?? null;

  const answered = resume.progress?.answered ?? 0;
  const hasDrafts = Object.keys(resume.responses || {}).length > 0;

  let welcomeText = "";
  let positionDesc = "";
  let showRegenerationNotice = false;

  if (resume.nextStep === "GATE2_COMPLETE") {
    welcomeText =
      "You've finished every part of Stage 2. Review your responses and submit when you're ready.";
    positionDesc = "All four pillars are complete.";

  } else if (resume.nextStep === "RESUME_PILLAR") {
    welcomeText =
      "You paused mid-way through Stage 2. Your timer kept running, but everything else is exactly where you left it.";
    if (hasDrafts) {
      positionDesc = `You'd answered ${answered} question${answered === 1 ? "" : "s"} in this window when you tapped Save and finish later.`;
    } else {
      positionDesc =
        itemCopy.subtitle || String(resume.pillarIntroTitle || "");
    }
    showRegenerationNotice = true;
  } else if (resume.nextStep === "START_PILLAR") {
    welcomeText = partLabel
      ? `You're ready for ${partLabel}. Resume to begin this part.`
      : String(resume.pillarIntroTitle || "");
    positionDesc =
      itemCopy.subtitle || String(resume.pillarIntroTitle || "");
  } else {
    // PILLAR_INTRO
    welcomeText = partLabel
      ? `Next up: ${partLabel}. You haven't started this part yet.`
      : String(resume.pillarIntroTitle || "");
    positionDesc = String(resume.pillarIntroTitle || itemCopy.subtitle || "");
  }

  const positionTitle =
    String(resume.screenTitle || "").trim() ||
    itemCopy.title ||
    String(resume.pillarIntroTitle || "").trim() ||
    pillarLabel ||
    partLabel;

  const crumbs = ["Stage 2", partLabel || pillarLabel, interviewCrumb].filter(
    (c) => Boolean(c && String(c).trim()),
  );

  const deadlineTotalFormatted =
    gateSecs != null ? formatSecondsAsHms(gateSecs) : "—";
  const deadlineHint =
    gateSecs != null
      ? `${Math.round(gateSecs / 3600)}-hour assessment window`
      : "";

  return {
    welcomeText,
    pausedTimeText: "Paused recently",
    positionTitle,
    positionDesc,
    crumbs,
    deadlineLabel: "Stage 2 deadline",
    deadlineRemainingSeconds: null,
    deadlineTotalFormatted,
    deadlineHint,
    interviewTimerLabel: "Interview timer",
    interviewTimerValue:
      interviewSecs != null ? formatSecondsAsHms(interviewSecs) : "—",
    completedLabel: "Completed so far",
    completedValue: totalParts > 0 ? `${completedCount} / ${totalParts}` : "—",
    completedSub: "parts in Stage 2",
    resumePath: resolveGate2ResumeNavigatePath(roleSlug, resume),
    showRegenerationNotice,
    nextStep: resume.nextStep,
    leaveOffReady: resume.nextStep !== "GATE2_COMPLETE",
  };
};
