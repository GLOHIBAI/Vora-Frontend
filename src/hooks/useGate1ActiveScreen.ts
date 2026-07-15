import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  assessmentKeys,
  useAssessmentDraftQuery,
  useGateResumeStateQuery,
  useStartAssessmentScreenMutation,
} from "../services/queries/assessments";
import type {
  AssessmentGateStartResponse,
  Gate1ScreenKey,
  GateResumeState,
} from "../services/queries/assessments/types";
import { getApiErrorMessage, type ApiError } from "../services/api";
import {
  parseGateResumeState,
  resolveGate1StartScreenKey,
} from "../utils/assessmentSession";
import { resolveGate1AssessmentId } from "../config/gate1Api";
import { normalizeGateStartResponse } from "../utils/assessmentItems";
import {
  buildGate1StartBody,
  isRecoverableGate1StartError,
} from "../utils/assessmentFlow";

interface UseGate1ActiveScreenResult {
  assessmentId: string | null;
  resumeState: GateResumeState | null;
  screenData: AssessmentGateStartResponse | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  isRecoverableError: boolean;
  reloadAfterSubmit: () => void;
  refetchResumeState: () => Promise<unknown>;
}

export const useGate1ActiveScreen = (): UseGate1ActiveScreenResult => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const assessmentId = resolveGate1AssessmentId();

  const startFresh = useMemo(() => {
    return (location.state as any)?.startFresh === true;
  }, [location.state]);

  const [screenData, setScreenData] =
    useState<AssessmentGateStartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bootToken, setBootToken] = useState(0);
  const [isBooting, setIsBooting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const bootedKeyRef = useRef<string | null>(null);
  const recoverAttemptsRef = useRef(0);

  const {
    data: resumeRaw,
    isLoading: resumeLoading,
    isFetched: resumeFetched,
    refetch: refetchResumeState,
  } = useGateResumeStateQuery(assessmentId ?? "", 1, {
    enabled: !!assessmentId && !startFresh,
  });

  const initialState = useMemo((): GateResumeState => ({
    assessmentId: assessmentId ?? "",
    session: 1,
    sessionLabel: "How you think",
    nextScreenKey: "personality" as any,
    completedScreenKeys: [],
    session1Screens: ["personality", "values", "cognitive_fixed", "numerical", "pattern", "verbal"],
    session2Screens: ["sjt_single_best", "sjt_rank", "sjt_most_least", "sjt_multi_select", "values_tradeoff"],
    gate1Complete: false,
    inProgress: null,
  }), [assessmentId]);

  const resumeState = useMemo(
    () => {
      if (startFresh) return initialState;
      return parseGateResumeState(resumeRaw);
    },
    [resumeRaw, startFresh, initialState],
  );

  const resumeSnapshot = useMemo(
    () =>
      resumeState
        ? [
            resumeState.nextScreenKey,
            resumeState.inProgress?.componentId ?? "",
            resumeState.gate1Complete ? "1" : "0",
            resumeState.completedScreenKeys.join(","),
          ].join("|")
        : "",
    [resumeState],
  );

  const { mutateAsync: startScreenAsync } = useStartAssessmentScreenMutation(1);

  const reloadAfterSubmit = useCallback(() => {
    bootedKeyRef.current = null;
    recoverAttemptsRef.current = 0;
    setScreenData(null);
    setError(null);
    setBootToken((n) => n + 1);
  }, [assessmentId, queryClient]);

  useEffect(() => {
    if (!assessmentId || (!startFresh && (!resumeFetched || resumeLoading))) return;
    if (!resumeState) {
      setError(
        "Could not load your assessment progress. Return to the journey and try again.",
      );
    }
  }, [assessmentId, resumeFetched, resumeLoading, resumeState, startFresh]);

  useEffect(() => {
    if (!assessmentId) {
      setError(
        "No active assessment. Return to the journey and begin Stage 1.",
      );
      return;
    }
    if ((!startFresh && !resumeFetched) || !resumeState) return;
    if (resumeState.gate1Complete) return;

    const screenKey = resolveGate1StartScreenKey(resumeState);
    const bootKey = `${bootToken}:${screenKey}:${resumeState.inProgress?.componentId ?? "new"}`;

    if (bootedKeyRef.current === bootKey) return;

    let cancelled = false;

    const boot = async () => {
      setIsBooting(true);
      setError(null);
      try {
        const started = await startScreenAsync({
          assessmentId,
          body: buildGate1StartBody(screenKey),
        });
        if (cancelled) return;

        const payload = normalizeGateStartResponse(started, screenKey);
        if (!payload) {
          setError("Could not load this screen. Please try again.");
          return;
        }

        if (payload.items.length === 0) {
          setIsGenerating(true);
          setTimeout(() => {
            if (!cancelled) {
              setBootToken((n) => n + 1);
            }
          }, 3000);
          return;
        }

        setIsGenerating(false);
        bootedKeyRef.current = bootKey;
        recoverAttemptsRef.current = 0;
        setScreenData(payload);
      } catch (err: unknown) {
        setIsGenerating(false);
        if (cancelled) return;

        const message = getApiErrorMessage(
          err,
          "Could not start this assessment screen. Please try again.",
        );
        const status = (err as ApiError).status;

        if (
          status === 400 &&
          isRecoverableGate1StartError(message) &&
          recoverAttemptsRef.current < 1
        ) {
          recoverAttemptsRef.current += 1;
          bootedKeyRef.current = null;
          setError(null);
          await queryClient.invalidateQueries({
            queryKey: assessmentKeys.resumeState(assessmentId, 1),
          });
          await refetchResumeState();
          setBootToken((n) => n + 1);
          return;
        }

        setError(message);
      } finally {
        if (!cancelled) {
          setIsBooting(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [
    assessmentId,
    resumeFetched,
    resumeSnapshot,
    resumeState,
    bootToken,
    startFresh,
    startScreenAsync,
    queryClient,
    refetchResumeState,
  ]);

  const isLoading =
    (!!assessmentId && !startFresh && resumeLoading) ||
    isBooting ||
    (!!assessmentId &&
      !!resumeState &&
      !resumeState.gate1Complete &&
      (!screenData || screenData.items.length === 0) &&
      !error);

  const isRecoverableError = !!error && isRecoverableGate1StartError(error);

  return {
    assessmentId,
    resumeState,
    screenData,
    isLoading,
    isGenerating,
    error,
    isRecoverableError,
    reloadAfterSubmit,
    refetchResumeState,
  };
};

/** Load saved draft whenever a screen has a componentId (recommended FE pattern). */
export const useGate1ScreenDraft = (
  assessmentId: string | null,
  screenData: AssessmentGateStartResponse | null,
) => {
  const shouldLoadDraft =
    !!assessmentId &&
    !!screenData?.componentId &&
    screenData.sessionState === "resumed";

  return useAssessmentDraftQuery(
    assessmentId ?? "",
    screenData?.componentId ?? "",
    {
      enabled: shouldLoadDraft,
    },
  );
};

export const submittedScreenKey = (
  screenData: AssessmentGateStartResponse | null,
): Gate1ScreenKey | null =>
  (screenData?.screenKey as Gate1ScreenKey | undefined) ?? null;
