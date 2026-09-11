import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';
import {
  useAssessmentGatesProgressQuery,
  useGateVerdictQuery,
  fetchGate3ResumeState,
  submitComponentResponses,
} from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId, parseGateProgressEntries, unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';

const GATE3_SUBMIT_MAX_ATTEMPTS = 20;
const GATE3_SUBMIT_RETRY_MS = 2500;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const isScoringInProgressError = (err: unknown): boolean => {
  const e = err as { status?: number; message?: string } | null;
  if (e?.status === 409) return true;
  const msg = (e?.message || '').toLowerCase();
  return msg.includes('still being scored') || msg.includes('generating') || msg.includes('scoring');
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

const RoleAssessmentStageThreeAnalyzing: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  // Ensure component submit is completed if needed based on resume-state
  useEffect(() => {
    if (!assessmentId) return;

    fetchGate3ResumeState(assessmentId)
      .then(async (raw: any) => {
        const resume = raw?.data || raw;
        const compId = resume?.componentId;
        if (resume?.scoringReady && resume?.nextStep !== 'AWAIT_VERDICT' && compId) {
          try {
            await submitComponentResponses(assessmentId, compId, {});
          } catch (e) {
            console.warn('Component submit notice in analyzing:', e);
          }
        }
      })
      .catch((e) => {
        console.warn('Resume state check notice:', e);
      });
  }, [assessmentId]);

  const { data: verdictRaw } = useGateVerdictQuery(assessmentId, 3, {
    enabled: !!assessmentId,
    refetchInterval: 2500,
  });
  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  const { data: progressRaw } = useAssessmentGatesProgressQuery(assessmentId, {
    enabled: !!assessmentId,
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
      return; // Gate 3 scoring is still in progress — stay on analyzing screen!
    }

    const rollup = (verdict as any)?.rollup || {};
    // CRITICAL: Route on outcome / passed, not overallScore (Stage 3 can fail at 71 even with overallScore 81)
    const isPassed =
      verdict.outcome === 'passed' ||
      verdict.passed === true ||
      verdict.verdict === 'pass' ||
      verdict.verdict === 'qualified' ||
      rollup.passed === true;

    const isFailed =
      verdict.outcome === 'failed' ||
      verdict.passed === false ||
      verdict.verdict === 'fail' ||
      verdict.verdict === 'not_yet' ||
      verdict.roleLocked === true ||
      rollup.passed === false;

    if (isPassed) {
      localStorage.setItem('vora_stage3_completed', 'true');
      localStorage.setItem('vora_stage4_unlocked', 'true');
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-3/results`, { replace: true });
      return;
    }
    if (isFailed) {
      localStorage.removeItem('vora_stage4_unlocked');
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-3/outcome`, { replace: true });
      return;
    }

    // Fallback: check gate progress rollup entries only if status is non-generating
    if (progressRaw) {
      const entries = parseGateProgressEntries(progressRaw);
      const gate3 = entries.find((e) => String(e.gate) === '3');

      if (gate3?.status === 'passed' || gate3?.status === 'completed') {
        localStorage.setItem('vora_stage3_completed', 'true');
        localStorage.setItem('vora_stage4_unlocked', 'true');
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-3/results`, { replace: true });
      } else if (gate3?.status === 'failed') {
        localStorage.removeItem('vora_stage4_unlocked');
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-3/outcome`, { replace: true });
      }
    }
  }, [verdict, progressRaw, roleSlug, navigate]);

  return (
    <AssessmentAnalyzingView
      roleSlug={roleSlug}
      title="Scoring Stage 3"
      subtitle="We're reviewing your full Stage 3 video interview & executive presence profile."
      steps={[
        'Video responses reviewed',
        'Substance assessed against role demands',
        'Presence & composure calibrated',
        'Communication clarity scored',
        'Performing response consistency & integrity checks',
      ]}
      initialStepIndex={0}
      schedule={schedule}
    />
  );
};

export default RoleAssessmentStageThreeAnalyzing;
