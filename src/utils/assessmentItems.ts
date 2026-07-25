import type {
  AssessmentGateStartResponse,
  AssessmentItem,
  AssessmentItemType,
  AssessmentProgress,
  AdaptiveStepResponse,
  AssessmentItemContent,
  SaveDraftResponse,
} from "../services/queries/assessments/types";
import { unwrapAssessmentData } from "./assessmentSession";

/** Backend may emit short type names; map to frontend canonical types. */
const ITEM_TYPE_ALIASES: Record<string, AssessmentItemType> = {
  likert: "likert_scale",
  sjt_rank: "sjt_rank_all",
  values_tradeoff: "values_tradeoff",
  adaptive: "adaptive_mcq",
};

export const normalizeAssessmentItemType = (
  type: string,
): AssessmentItemType => {
  const aliased = ITEM_TYPE_ALIASES[type];
  if (aliased) return aliased;
  return type as AssessmentItemType;
};

interface LikertQuestionLike {
  id: string;
  text?: string;
  stem?: string;
  scaleLabels?: string[];
}

export const getLikertQuestions = (
  item: AssessmentItem,
): Array<{ id: string; text: string; scaleLabels?: string[] }> => {
  const raw =
    (item.content.questions as LikertQuestionLike[] | undefined) ??
    (item.content.statements as LikertQuestionLike[] | undefined) ??
    [];

  if (raw.length > 0) {
    return raw.map((question) => ({
      id: question.id,
      text: question.text ?? question.stem ?? "",
      scaleLabels: question.scaleLabels,
    }));
  }

  const prompt = item.content.prompt ?? item.content.scenario;
  return prompt ? [{ id: item.id, text: String(prompt) }] : [];
};

const normalizeItemContent = (
  type: AssessmentItemType,
  content: Record<string, unknown>,
): Record<string, unknown> => {
  const next = { ...content };

  if (type === "likert_scale" && Array.isArray(content.questions)) {
    next.questions = content.questions.map((row) => {
      if (!row || typeof row !== "object") return row;
      const question = row as LikertQuestionLike;
      return {
        ...question,
        text: question.text ?? question.stem ?? "",
      };
    });
  }

  return next;
};

export const normalizeAssessmentItem = (
  raw: unknown,
): AssessmentItem | null => {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const type = normalizeAssessmentItemType(String(item.type ?? ""));
  const contentRaw = item.content;
  const content =
    contentRaw && typeof contentRaw === "object"
      ? normalizeItemContent(type, contentRaw as Record<string, unknown>)
      : {};

  return {
    id: String(item.id ?? ""),
    type,
    sequence: typeof item.sequence === "number" ? item.sequence : 1,
    total: typeof item.total === "number" ? item.total : 1,
    partKey: typeof item.partKey === "string" ? item.partKey : undefined,
    title: typeof item.title === "string" ? item.title : undefined,
    content,
    saveResume: item.saveResume === true,
    eyebrow:
      typeof (item.eyebrow ?? item.eyebrow) === "string"
        ? String(item.eyebrow)
        : undefined,
    screenTitle:
      typeof (item.screenTitle ?? item.screen_title) === "string"
        ? String(item.screenTitle ?? item.screen_title)
        : undefined,
    screenSubtitle:
      typeof (item.screenSubtitle ?? item.screen_subtitle) === "string"
        ? String(item.screenSubtitle ?? item.screen_subtitle)
        : undefined,
    whyThisMatters:
      typeof (item.whyThisMatters ?? item.why_this_matters) === "string"
        ? String(item.whyThisMatters ?? item.why_this_matters)
        : undefined,
    sessionIndex:
      typeof (item.sessionIndex ?? item.session_index) === "number"
        ? Number(item.sessionIndex ?? item.session_index)
        : undefined,
    sessionLabel:
      typeof (item.sessionLabel ?? item.session_label) === "string"
        ? String(item.sessionLabel ?? item.session_label)
        : undefined,
  } as AssessmentItem;
};

export const normalizeAssessmentItems = (items: unknown): AssessmentItem[] =>
  Array.isArray(items)
    ? items
        .map((item) => normalizeAssessmentItem(item))
        .filter(
          (item): item is AssessmentItem => item !== null && Boolean(item.id),
        )
    : [];

const normalizeProgress = (raw: unknown): AssessmentProgress => {
  if (!raw || typeof raw !== "object") {
    return { percent: 0, completedScreens: 0, totalScreens: 0 };
  }

  const progress = raw as Record<string, unknown>;
  if (typeof progress.percent === "number") {
    return {
      percent: progress.percent,
      completedScreens: Number(progress.completedScreens ?? 0),
      totalScreens: Number(progress.totalScreens ?? 0),
      answered:
        typeof progress.answered === "number" ? progress.answered : undefined,
      total: typeof progress.total === "number" ? progress.total : undefined,
    };
  }

  const current = Number(progress.current ?? progress.answered ?? 0);
  const total = Number(progress.total ?? 0);
  return {
    percent: total > 0 ? Math.round((current / total) * 100) : 0,
    completedScreens: current,
    totalScreens: total,
    answered: current,
    total,
  };
};

const normalizeAdaptiveMcqState = (
  raw: unknown,
): AssessmentGateStartResponse["adaptiveMcq"] => {
  if (!raw || typeof raw !== "object") return undefined;
  const payload = raw as Record<string, unknown>;
  const priorStepsRaw = payload.priorSteps ?? payload.prior_steps;
  const priorSteps = Array.isArray(priorStepsRaw)
    ? priorStepsRaw.map((stepRaw, idx) => {
        const stepObj = (stepRaw || {}) as Record<string, unknown>;
        const contentRaw = stepObj.content;
        const optionsRaw =
          contentRaw && typeof contentRaw === "object"
            ? ((contentRaw as Record<string, unknown>).options ??
              (contentRaw as Record<string, unknown>).choices)
            : undefined;
        return {
          step: typeof stepObj.step === "number" ? stepObj.step : idx,
          optionId: String(stepObj.optionId ?? stepObj.option_id ?? ""),
          content: {
            ...((contentRaw as Record<string, unknown>) ?? {}),
            options: Array.isArray(optionsRaw) ? optionsRaw : undefined,
          } as any,
        };
      })
    : [];

  return {
    itemId: String(payload.itemId ?? payload.item_id ?? ""),
    totalSteps: Number(payload.totalSteps ?? payload.total_steps ?? 0),
    currentStep: Number(payload.currentStep ?? payload.current_step ?? 0),
    complete: payload.complete === true,
    priorSteps,
  };
};

export const normalizeGateStartResponse = (
  raw: unknown,
  screenKey?: string,
): AssessmentGateStartResponse | null => {
  const payload = unwrapAssessmentData<Record<string, unknown>>(raw);
  const componentId = payload?.componentId ?? payload?.component_id;
  if (!payload || !componentId) return null;

  const timersRaw = payload.timers as Record<string, unknown> | undefined;

  return {
    componentId: String(componentId),
    screenKey: String(
      payload.screenKey ?? payload.screen_key ?? screenKey ?? "",
    ),
    items: normalizeAssessmentItems(payload.items),
    saveResume: payload.saveResume !== false,
    progress: normalizeProgress(payload.progress),
    table: payload.table,
    chart: payload.chart,
    timers: timersRaw
      ? {
          limitSeconds:
            typeof timersRaw.limitSeconds === "number"
              ? timersRaw.limitSeconds
              : typeof timersRaw.gateLimitSecs === "number"
                ? timersRaw.gateLimitSecs
                : undefined,
          warnAtSeconds:
            typeof timersRaw.warnAtSeconds === "number"
              ? timersRaw.warnAtSeconds
              : undefined,
          startedAt:
            typeof timersRaw.startedAt === "string"
              ? timersRaw.startedAt
              : undefined,
        }
      : undefined,
    sessionState:
      payload.sessionState === "resumed" || payload.sessionState === "new"
        ? payload.sessionState
        : undefined,
    questionsRegenerated: payload.questionsRegenerated === true,
    adaptiveMcq: normalizeAdaptiveMcqState(
      payload.adaptiveMcq ?? payload.adaptive_mcq,
    ),
    gate: typeof payload.gate === "number" ? payload.gate : undefined,
    gateName:
      typeof (payload.gateName ?? payload.gate_name) === "string"
        ? String(payload.gateName ?? payload.gate_name)
        : undefined,
  };
};

const normalizeAdaptiveStepContent = (
  raw: Record<string, unknown> | undefined,
): AssessmentItemContent | undefined => {
  if (!raw) return undefined;

  const stem = raw.stem ?? raw.prompt ?? raw.scenario;
  const options = raw.options ?? raw.choices;

  return {
    ...raw,
    stem: typeof stem === "string" ? stem : undefined,
    prompt:
      typeof (raw.prompt ?? stem) === "string"
        ? String(raw.prompt ?? stem)
        : undefined,
    options: Array.isArray(options) ? options : undefined,
  };
};

/** POST .../items/:itemId/adaptive unwrap envelope; map stem + options for next step. */
export const normalizeAdaptiveStepResponse = (
  raw: unknown,
): AdaptiveStepResponse => {
  const payload = unwrapAssessmentData<Record<string, unknown>>(raw) ?? {};

  let nextItem = normalizeAdaptiveStepContent(
    (payload.nextItem ?? payload.next_item) as
      | Record<string, unknown>
      | undefined,
  );

  if (!nextItem && (payload.stem || payload.options)) {
    nextItem = normalizeAdaptiveStepContent(payload);
  }

  return {
    complete: payload.complete === true,
    stepIndex: Number(payload.stepIndex ?? payload.step_index ?? 0),
    totalSteps: Number(payload.totalSteps ?? payload.total_steps ?? 0),
    nextItem,
    componentStatus:
      payload.componentStatus === "completed" ||
      payload.component_status === "completed"
        ? "completed"
        : undefined,
  };
};

export const normalizeSaveDraftResponse = (raw: unknown): SaveDraftResponse => {
  const payload =
    unwrapAssessmentData<Record<string, unknown>>(raw) ??
    (raw as Record<string, unknown>);
  return {
    items: normalizeAssessmentItems(payload?.items),
    questionsRegenerated: payload?.questionsRegenerated === true,
    responses: (payload?.responses as SaveDraftResponse["responses"]) ?? {},
    progress: normalizeProgress(payload?.progress),
  };
};

export const isLikertItem = (type: AssessmentItemType | string): boolean =>
  normalizeAssessmentItemType(String(type)) === "likert_scale";

export interface ForcedChoiceStatement {
  id: string;
  label: string;
  tag?: string;
}

export interface ForcedChoiceBlock {
  id: string;
  statements: ForcedChoiceStatement[];
}

export const getForcedChoiceBlocks = (
  item: AssessmentItem,
): ForcedChoiceBlock[] => {
  const rawBlocks = item.content.blocks as
    | Array<Record<string, unknown>>
    | undefined;
  if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
    return rawBlocks.map((block, index) => {
      const statementsRaw = block.statements ?? block.options ?? [];
      const statements = Array.isArray(statementsRaw)
        ? statementsRaw.map((row, stmtIdx) => {
            if (!row || typeof row !== "object") {
              return {
                id: `${block.id ?? index}-s${stmtIdx}`,
                label: String(row),
              };
            }
            const stmt = row as Record<string, unknown>;
            return {
              id: String(stmt.id ?? `${block.id ?? index}-s${stmtIdx}`),
              label: String(stmt.label ?? stmt.text ?? stmt.stem ?? ""),
              tag: typeof stmt.tag === "string" ? stmt.tag : undefined,
            };
          })
        : [];
      return {
        id: String(block.id ?? `block-${index}`),
        statements,
      };
    });
  }
  return [];
};

export interface ValuesAbPair {
  id: string;
  labelA: string;
  labelB: string;
}

export const getValuesAbPairs = (item: AssessmentItem): ValuesAbPair[] => {
  const rawPairs = item.content.pairs as
    | Array<Record<string, unknown>>
    | undefined;
  if (!Array.isArray(rawPairs)) return [];

  return rawPairs.map((pair, index) => {
    const id = String(pair.id ?? `pair-${index}`);
    const a = pair.a as Record<string, unknown> | undefined;
    const b = pair.b as Record<string, unknown> | undefined;
    return {
      id,
      labelA: String(
        a?.label ?? a?.text ?? pair.labelA ?? pair.optionA ?? "Option A",
      ),
      labelB: String(
        b?.label ?? b?.text ?? pair.labelB ?? pair.optionB ?? "Option B",
      ),
    };
  });
};

export interface ValuesTradeoffTension {
  id: string;
  leftLabel: string;
  rightLabel: string;
  leftSub?: string;
  rightSub?: string;
  scaleMin: number;
  scaleMax: number;
}

export const getValuesTradeoffTensions = (
  item: AssessmentItem,
): ValuesTradeoffTension[] => {
  const raw =
    (item.content.tensions as Array<Record<string, unknown>> | undefined) ??
    (item.content.pairs as Array<Record<string, unknown>> | undefined) ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw.map((row, index) => {
    const left = row.left as Record<string, unknown> | undefined;
    const right = row.right as Record<string, unknown> | undefined;
    const a = row.a as Record<string, unknown> | undefined;
    const b = row.b as Record<string, unknown> | undefined;
    const leanA = row.leanA as Record<string, unknown> | undefined;
    const leanB = row.leanB as Record<string, unknown> | undefined;
    
    const leftSubVal =
      left?.subHeadline ??
      left?.description ??
      a?.subHeadline ??
      a?.description ??
      leanA?.subHeadline ??
      leanA?.description ??
      row.leftSub ??
      undefined;

    const rightSubVal =
      right?.subHeadline ??
      right?.description ??
      b?.subHeadline ??
      b?.description ??
      leanB?.subHeadline ??
      leanB?.description ??
      row.rightSub ??
      undefined;

    return {
      id: String(row.id ?? `tension-${index}`),
      leftLabel: String(
        left?.title ??
          left?.label ??
          left?.text ??
          a?.label ??
          a?.text ??
          leanA?.headline ??
          leanA?.title ??
          leanA?.label ??
          leanA?.text ??
          row.leftLabel ??
          "A",
      ),
      rightLabel: String(
        right?.title ??
          right?.label ??
          right?.text ??
          b?.label ??
          b?.text ??
          leanB?.headline ??
          leanB?.title ??
          leanB?.label ??
          leanB?.text ??
          row.rightLabel ??
          "B",
      ),
      leftSub: leftSubVal ? String(leftSubVal) : undefined,
      rightSub: rightSubVal ? String(rightSubVal) : undefined,
      scaleMin: typeof row.scaleMin === "number" ? row.scaleMin : -2,
      scaleMax: typeof row.scaleMax === "number" ? row.scaleMax : 2,
    };
  });
};

export const getRankOptionIds = (item: AssessmentItem): string[] => {
  const options = item.content.options ?? item.content.values ?? [];
  return options.map((opt) => opt.id);
};

export const isLikertItemComplete = (
  item: AssessmentItem,
  value: unknown,
): boolean => {
  if (!isLikertItem(item.type)) return false;
  const questions = getLikertQuestions(item);
  if (questions.length === 0) return false;
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;

  const answers = value as Record<string, unknown>;
  return questions.every(
    (question) =>
      answers[question.id] !== undefined && answers[question.id] !== null,
  );
};
