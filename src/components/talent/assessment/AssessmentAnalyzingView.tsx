import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleApplyContextBanner from '../../auth/RoleApplyContextBanner';
import AssessmentScoringPulseIcon from './AssessmentScoringPulseIcon';
import ProfileMatchStepRow from '../profileMatch/ProfileMatchStepRow';
import ProfileMatchProgressBar from '../profileMatch/ProfileMatchProgressBar';
import { useGetPublicRoleQuery } from '../../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../../types/roleLanding';
import type { ProfileMatchStepStatus } from '../../../constants/profileMatchBuilding';

export type AssessmentAnalyzingStepItem = {
  title: string;
  subtitle?: string;
};

export type AssessmentAnalyzingStepSchedule = {
  /** Absolute ms from mount when this step index becomes active (or done if past last). */
  atMs: number;
  /** Active step index after this tick (use steps.length to mark all done). */
  stepIndex: number;
};

export type AssessmentAnalyzingViewProps = {
  roleSlug?: string;
  role?: PublicRoleLandingData | null;
  eyebrow?: string;
  title?: string;
  headline?: string;
  subtitle?: React.ReactNode;
  steps: (string | AssessmentAnalyzingStepItem)[];
  /** Starting active step index (0-based). */
  initialStepIndex?: number;
  /** Controlled active step index from parent component. */
  activeStepIndex?: number;
  /** Timed advances; last entry typically sets stepIndex to steps.length. */
  schedule?: AssessmentAnalyzingStepSchedule[];
  /** Optional absolute ms from mount when navigation fires. */
  redirectAtMs?: number;
  /** Path relative to /onboarding/talent/:roleSlug/ or absolute app path. */
  redirectPath?: string;
  /** Optional callback fired when complete. */
  onComplete?: () => void;
  /** Optional controlled percentage (0-100). */
  progress?: number;
  reassuranceText?: string;
  footerNote?: string;
  headerMeta?: string;
};

/**
 * Shared full-page scoring & analyzing view styled consistently across all stages
 * (Stage 1, Stage 2, Stage 3, and CV profile matching).
 */
const AssessmentAnalyzingView: React.FC<AssessmentAnalyzingViewProps> = ({
  roleSlug = '',
  role: initialRole,
  title,
  headline,
  subtitle,
  steps,
  initialStepIndex = 0,
  activeStepIndex,
  schedule,
  redirectAtMs,
  redirectPath,
  onComplete,
  progress: externalProgress,
}) => {
  const navigate = useNavigate();
  const [internalStepIdx, setInternalStepIdx] = useState(initialStepIndex);

  const { data: roleResponse } = useGetPublicRoleQuery(roleSlug, {
    enabled: !initialRole && !!roleSlug,
  });

  const role: PublicRoleLandingData | null = useMemo(() => {
    if (initialRole) return initialRole;
    if (!roleSlug) return null;
    const apiData = roleResponse?.data || roleResponse;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [initialRole, roleSlug, roleResponse]);

  const activeIdx = activeStepIndex !== undefined ? activeStepIndex : internalStepIdx;

  // Handle schedule timers if schedule is passed and not externally controlled
  useEffect(() => {
    if (!schedule || schedule.length === 0 || activeStepIndex !== undefined) return;

    const timers = schedule.map(({ atMs, stepIndex }) =>
      window.setTimeout(() => setInternalStepIdx(stepIndex), atMs),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [schedule, activeStepIndex]);

  // Handle automatic redirect timer if specified
  useEffect(() => {
    let redirectTimer: number | null = null;
    if (redirectAtMs && redirectAtMs > 0) {
      redirectTimer = window.setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
        if (redirectPath) {
          const path = redirectPath.startsWith('/')
            ? redirectPath
            : `/onboarding/talent/${roleSlug}/${redirectPath}`;
          navigate(path, { replace: true });
        }
      }, redirectAtMs);
    }

    return () => {
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [navigate, redirectAtMs, redirectPath, roleSlug, onComplete]);

  // Normalize step objects
  const normalizedSteps: AssessmentAnalyzingStepItem[] = useMemo(() => {
    return steps.map((s) => {
      if (typeof s === 'string') {
        return { title: s, subtitle: s };
      }
      return { title: s.title, subtitle: s.subtitle || s.title };
    });
  }, [steps]);

  // Calculate percentage
  let computedPercent = Math.min(100, Math.round(((activeIdx + 1) / normalizedSteps.length) * 100));
  if (computedPercent >= 100 && activeIdx < normalizedSteps.length) {
    computedPercent = 95;
  }
  const currentProgress = externalProgress !== undefined ? externalProgress : computedPercent;

  const displayTitle = headline || title || 'Scoring Stage...';
  const formattedTitle = displayTitle.endsWith('...') ? displayTitle : `${displayTitle}...`;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top Role Context Header */}
      {role ? (
        <RoleApplyContextBanner role={role} />
      ) : (
        <div className="h-4" />
      )}

      {/* Main Centered Scoring Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[520px] text-center">
          {/* Animated Blue Pulse AI Scoring Icon */}
          <AssessmentScoringPulseIcon />

          {/* Heading */}
          <h1 className="text-2xl sm:text-[26px] font-semibold text-[#1A1A1A] tracking-tight mb-2">
            {formattedTitle}
          </h1>

          {/* Subtitle */}
          <div className="text-sm text-[#808080] leading-relaxed mb-7 max-w-[420px] mx-auto">
            {subtitle ? (
              subtitle
            ) : role ? (
              <>
                Hang tight we&apos;re reviewing your answers for{' '}
                <strong className="text-[#0047CC] font-semibold">{role.roleTitle}</strong>.
              </>
            ) : (
              "Hang tight we're reviewing your interview profile."
            )}
          </div>

          {/* Steps Checklist Rows */}
          <div className="text-left mb-8 space-y-1">
            {normalizedSteps.map((step, index) => {
              const isCompleted = index < activeIdx;
              const isRunning = index === activeIdx;
              const status: ProfileMatchStepStatus = isCompleted
                ? 'done'
                : isRunning
                  ? 'running'
                  : 'queued';

              return (
                <ProfileMatchStepRow
                  key={index}
                  title={step.title}
                  subtitle={step.subtitle || step.title}
                  status={status}
                  isLast={index === normalizedSteps.length - 1}
                />
              );
            })}
          </div>

          {/* Bottom Progress Bar */}
          <ProfileMatchProgressBar progress={currentProgress} />
        </div>
      </div>
    </div>
  );
};

export default AssessmentAnalyzingView;
