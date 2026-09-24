const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUUID = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  return UUID_REGEX.test(str.trim());
};

/**
 * Extracts assessmentId from candidate object or candidate actions.
 * NEVER falls back to rolePostingId!
 */
export const resolveAssessmentId = (candidate?: any, rolePostingId?: string): string => {
  if (!candidate) return '';

  if (isUUID(candidate.assessmentId)) {
    return candidate.assessmentId;
  }

  // Check actions array for REJECT_APPLICANT or any action with /assessments/<UUID> path
  if (Array.isArray(candidate.actions)) {
    const rejectAction = candidate.actions.find(
      (a: any) => (a.key || '').toUpperCase() === 'REJECT_APPLICANT' || (a.label || '').toLowerCase().includes('reject')
    );
    const pathMatch = (rejectAction?.path || '').match(/\/assessments\/([0-9a-f-]{36})/i)?.[1];
    if (isUUID(pathMatch)) {
      return pathMatch;
    }

    for (const act of candidate.actions) {
      const match = (act.path || '').match(/\/assessments\/([0-9a-f-]{36})/i)?.[1];
      if (isUUID(match)) {
        return match;
      }
    }
  }

  // If candidate.id is a UUID and is NOT equal to the rolePostingId
  if (isUUID(candidate.id) && candidate.id !== rolePostingId) {
    return candidate.id;
  }

  return '';
};

/**
 * Rejection only works after Stage 3 pass (COMPLETED + overallPassed).
 * Candidates still IN_PROGRESS at Stage 3 or with mid-assessment exits stay Failed, not this form.
 */
export const isCandidateEligibleForRejection = (candidate?: any): { eligible: boolean; message?: string } => {
  if (!candidate) {
    return { eligible: true };
  }

  const rejectAction = Array.isArray(candidate.actions)
    ? candidate.actions.find((a: any) => (a.key || '').toUpperCase() === 'REJECT_APPLICANT')
    : undefined;

  if (rejectAction && typeof rejectAction.enabled === 'boolean') {
    if (!rejectAction.enabled) {
      return {
        eligible: false,
        message: 'Rejection only works after Stage 3 pass (COMPLETED + overallPassed). Mid-assessment exits stay Failed, not this form.',
      };
    }
    return { eligible: true };
  }

  // Explicit flags
  if (candidate.interviewReady === false || candidate.overallPassed === false) {
    return {
      eligible: false,
      message: 'Rejection only works after Stage 3 pass (COMPLETED + overallPassed). Mid-assessment exits stay Failed, not this form.',
    };
  }

  const status = (candidate.overallStatus || candidate.status || '').toUpperCase();

  // If candidate is actively in progress or pending
  if (status === 'IN_PROGRESS' || status === 'PENDING' || status === 'UNDER_REVIEW') {
    return {
      eligible: false,
      message: 'Candidate is still in progress. Rejection only works after Stage 3 pass (COMPLETED + overallPassed).',
    };
  }

  // If candidate already exited (FAILED, INELIGIBLE, REJECTED, HIRED)
  if (status.includes('FAIL') || status.includes('INELIGIBLE')) {
    return {
      eligible: false,
      message: 'Candidate exited mid-assessment and remains classified as Failed. This rejection form is for post-Stage 3 decisions.',
    };
  }

  if (status.includes('REJECT') || status.includes('HIRED')) {
    return {
      eligible: false,
      message: 'Decision has already been recorded for this candidate.',
    };
  }

  // If stage tracking is present
  if (candidate.stage) {
    if (candidate.stage.current < 3 || (!candidate.stage.completed && candidate.stage.current === 3)) {
      return {
        eligible: false,
        message: 'Candidate has not completed Stage 3. Rejection only works after Stage 3 pass (COMPLETED + overallPassed).',
      };
    }
  }

  return { eligible: true };
};
