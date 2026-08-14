import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';
import { useAssessmentGatesProgressQuery, useGateVerdictQuery, useSubmitGateMutation } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId, parseGateProgressEntries, unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';

const GATE2_SUBMIT_MAX_ATTEMPTS = 20;
const GATE2_SUBMIT_RETRY_MS = 2500;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const isScoringInProgressError = (err: unknown): boolean => {
  const e = err as { status?: number; message?: string } | null;
  if (e?.status === 409) return true;
  const msg = (e?.message || '').toLowerCase();
  return msg.includes('still being scored');
};

const isAlreadySubmittedError = (err: unknown): boolean => {
  const e = err as { status?: number; message?: string; code?: string } | null;
  const msg = (e?.message || '').toLowerCase();
  const code = (e?.code || '').toLowerCase();
  return (
    msg.includes('already submitted') ||
    msg.includes('already been submitted') ||
    code.includes('already_submitted') ||
    (e?.status === 400 && (msg.includes('completed') || msg.includes('submitted')))
  );
};

const RoleAssessmentStageTwoAnalyzing: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  const submitGate = useSubmitGateMutation();
  const submitAttemptedRef = useRef(false);
  const [gateSubmitted, setGateSubmitted] = useState(false);

  // Fire POST gates/2/submit on mount with scoring-retry logic
  useEffect(() => {
    if (!assessmentId || submitAttemptedRef.current) return;
    submitAttemptedRef.current = true;

    const doSubmit = async () => {
      for (let attempt = 1; attempt <= GATE2_SUBMIT_MAX_ATTEMPTS; attempt++) {
        try {
          await submitGate.mutateAsync({
            assessmentId,
            gate: 2,
            suppressErrorToast: true,
          });
          setGateSubmitted(true);
          return;
        } catch (err) {
          if (isAlreadySubmittedError(err)) {
            // Gate was already submitted — that's fine, proceed to poll verdict
            setGateSubmitted(true);
            return;
          }
          const canRetry = isScoringInProgressError(err) && attempt < GATE2_SUBMIT_MAX_ATTEMPTS;
          if (!canRetry) {
            console.error('Gate 2 final submit failed after retries:', err);
            const errStr = String((err as any)?.message || (err as any)?.data?.message || '').toLowerCase();
            if (
              errStr.includes('review screen') ||
              errStr.includes('before checking your verdict') ||
              errStr.includes('incomplete') ||
              errStr.includes('final submit')
            ) {
              navigate(`/onboarding/talent/${roleSlug}/interview/journey`, { replace: true });
              return;
            }
            setGateSubmitted(true);
            return;
          }
          await sleep(GATE2_SUBMIT_RETRY_MS);
        }
      }
      setGateSubmitted(true);
    };

    void doSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  const { data: verdictRaw } = useGateVerdictQuery(assessmentId, 2, {
    enabled: !!assessmentId && gateSubmitted,
    refetchInterval: 2500,
  });
  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  const { data: progressRaw } = useAssessmentGatesProgressQuery(assessmentId, {
    enabled: !!assessmentId && gateSubmitted,
    refetchInterval: 2500,
  });

  const schedule = useMemo(
    () => [
      { atMs: 1200, stepIndex: 1 },
      { atMs: 2400, stepIndex: 2 },
      { atMs: 3600, stepIndex: 3 },
      { atMs: 4800, stepIndex: 4 },
    ],
    [],
  );

  useEffect(() => {
    if (!verdict) return;

    const status = String(verdict.status || '').toLowerCase();
    if (status === 'generating' || status === 'pending' || status === 'processing' || status === 'in_progress') {
      return; // Gate 2 scoring is still in progress — stay on analyzing screen!
    }

    const rollup = (verdict as any)?.rollup || {};
    const isPassed =
      verdict.passed === true ||
      verdict.verdict === 'pass' ||
      verdict.verdict === 'qualified' ||
      verdict.outcome === 'passed' ||
      rollup.passed === true ||
      rollup.verdict === 'pass' ||
      rollup.verdict === 'qualified';

    const isFailed =
      verdict.passed === false ||
      verdict.verdict === 'fail' ||
      verdict.outcome === 'failed' ||
      verdict.roleLocked === true ||
      (rollup.passed === false && (rollup.verdict === 'fail' || rollup.verdict === 'not_yet'));

    if (isPassed) {
      localStorage.setItem('vora_stage2_completed', 'true');
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/results`, { replace: true });
      return;
    }
    if (isFailed) {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/outcome`, { replace: true });
      return;
    }

    // 2. Fallback check: check gate progress rollup entries only if status is non-generating
    if (progressRaw) {
      const entries = parseGateProgressEntries(progressRaw);
      const gate2 = entries.find((e) => String(e.gate) === '2');

      if (gate2?.status === 'passed' || gate2?.status === 'completed') {
        localStorage.setItem('vora_stage2_completed', 'true');
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/results`, { replace: true });
      } else if (gate2?.status === 'failed') {
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/outcome`, { replace: true });
      }
    }
  }, [verdict, progressRaw, roleSlug, navigate]);

  return (
    <AssessmentAnalyzingView
      roleSlug={roleSlug}
      title="Scoring Stage 2"
      subtitle="We're reviewing your full Stage 2 profile."
      steps={[
        'Knowledge interviews (Part 1) cross-checked',
        'Expertise interviews (Part 2) reviewed',
        'Reasoning patterns (Part 3) read against role demands',
        'Written simulations (Part 4) scored for clarity and tone',
        'Performing response consistency & integrity checks',
      ]}
      initialStepIndex={0}
      schedule={schedule}
    />
  );
};

export default RoleAssessmentStageTwoAnalyzing;

