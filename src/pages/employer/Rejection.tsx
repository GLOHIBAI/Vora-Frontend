import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  AlertTriangleIcon,
  CheckIcon,
} from '../../components/common/Icons';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import { useEmployerDecideRejectMutation } from '../../services/queries/assessments';

import { REJECTION_REASONS, REJECTION_DETAILS_MIN_LENGTH, FLAGGED_WORDS } from '../../constants/rejection';
import type { RejectionPrimaryReason } from '../../constants/rejection';
import { 
  isUUID, 
  resolveAssessmentId, 
  isCandidateEligibleForRejection as checkRejectionEligibility 
} from '../../utils/assessmentDecision';

const Rejection: React.FC = () => {
  const { id, applicantId, assessmentId: routeAssessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  const [step, setStep] = useState<'form' | 'flagged' | 'confirmed'>('form');
  const [selectedReason, setSelectedReason] = useState<RejectionPrimaryReason | ''>('');
  const [details, setDetails] = useState('');
  const [isFlagged, setIsFlagged] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const rejectMutation = useEmployerDecideRejectMutation();

  // Resolve assessmentId strictly — NEVER fall back to id (which is the rolePostingId)!
  const assessmentId = (() => {
    const params = new URLSearchParams(location.search);
    const qAssessmentId = params.get('assessmentId');
    if (isUUID(qAssessmentId)) return qAssessmentId!;

    if (isUUID(state.assessmentId)) return state.assessmentId!;
    if (isUUID(state.applicant?.assessmentId)) return state.applicant.assessmentId!;

    const actionMatch = state.actionPath?.match(/\/assessments\/([0-9a-f-]{36})/i)?.[1];
    if (isUUID(actionMatch)) return actionMatch!;

    if (isUUID(routeAssessmentId)) return routeAssessmentId!;

    // If applicantId in route is a UUID (and not equal to the rolePostingId)
    if (isUUID(applicantId) && applicantId !== id) {
      return applicantId!;
    }

    if (state.applicant) {
      const resolved = resolveAssessmentId(state.applicant, id);
      if (resolved) return resolved;
    }

    return '';
  })();

  const applicant = state.applicant;
  // Rejection only works after Stage 3 pass (COMPLETED + overallPassed).
  // Mid-assessment exits stay Failed, not this form.
  const eligibility = applicant ? checkRejectionEligibility(applicant) : { eligible: true };
  const isCandidateEligibleForRejection = eligibility.eligible;
  const ineligibilityReason = eligibility.message;

  const handleDetailsChange = (val: string) => {
    setDetails(val);
    const hasFlaggedWords = FLAGGED_WORDS.some(word => val.toLowerCase().includes(word));
    setIsFlagged(hasFlaggedWords && val.length > REJECTION_DETAILS_MIN_LENGTH);
  };

  const handleSubmit = async () => {
    if (!assessmentId) {
      setSubmitError('Missing assessment ID. Rejections require a valid candidate assessment ID.');
      return;
    }

    if (!isCandidateEligibleForRejection) {
      setSubmitError('Rejection only works after Stage 3 pass (COMPLETED + overallPassed). Mid-assessment exits stay Failed, not this form.');
      return;
    }

    if (!selectedReason || details.trim().length < REJECTION_DETAILS_MIN_LENGTH) return;

    if (isFlagged && step === 'form') {
      setStep('flagged');
      return;
    }

    setSubmitError(null);
    try {
      await rejectMutation.mutateAsync({
        assessmentId,
        kind: 'LEGITIMATE',
        primaryReason: selectedReason,
        details: details.trim(),
      });
      setStep('confirmed');
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit rejection. Please verify the candidate has completed and passed Stage 3.');
    }
  };

  const isFormValid =
    !!assessmentId &&
    isCandidateEligibleForRejection &&
    !!selectedReason &&
    details.trim().length >= REJECTION_DETAILS_MIN_LENGTH;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-gray-400 font-medium overflow-x-auto whitespace-nowrap">
        <Link to="/jobs" className="text-[#0047CC] hover:underline">Jobs</Link>
        <ChevronRightIcon size={14} />
        {id && (
          <>
            <Link to={`/jobs/${id}`} className="text-[#0047CC] hover:underline truncate max-w-[150px]">Role Details</Link>
            <ChevronRightIcon size={14} />
          </>
        )}
        <span className="text-gray-900 font-medium">Rejection</span>
      </nav>

      {/* Candidate Chip */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-medium text-lg shrink-0">
            !
          </div>
          <div>
            <div className="text-[14px] font-medium text-gray-900">{applicant?.applicantCode || applicantId || 'Applicant'}</div>
            <div className="text-[12px] text-gray-500 font-medium">Document rejection — Stage 4</div>
          </div>
        </div>
        {assessmentId && (
          <span className="text-[11px] font-mono text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md">
            ID: {assessmentId.slice(0, 8)}…{assessmentId.slice(-4)}
          </span>
        )}
      </div>

      {/* Warning: Missing assessment ID */}
      {!assessmentId && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-[13px]">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon size={16} className="text-red-600 shrink-0" />
            <span>
              <strong>Missing assessment ID:</strong> Cannot submit rejection without an assessment ID. Please access this form through the applicant row in the candidates list.
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-bold text-red-900 underline hover:no-underline cursor-pointer shrink-0 ml-4"
          >
            Return to Candidates
          </button>
        </div>
      )}

      {/* Warning: Mid-assessment candidate not ready for decision */}
      {!isCandidateEligibleForRejection && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-800 text-[13px]">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>Candidate In Progress:</strong> {ineligibilityReason || 'Rejection only works after Stage 3 pass (COMPLETED + overallPassed). Mid-assessment exits remain classified as Failed.'}
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-bold text-amber-900 underline hover:no-underline cursor-pointer shrink-0 ml-4"
          >
            Go Back
          </button>
        </div>
      )}

      {step === 'form' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-gray-900 ">Document Rejection Reason</h2>
            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
              A rejection reason is required. VORA reviews all rejections against the candidate's verified interview record. Reasons that reference competency, communication ability, or professional judgment, already assessed and passed, will trigger an automatic review.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-[14px] font-medium text-gray-900">Select primary rejection reason</label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label 
                  key={reason.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedReason === reason.id 
                      ? 'border-[#0047CC] bg-[#EBF6FF]' 
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input autoComplete="off" 
                    type="radio" 
                    name="rejection_reason" 
                    className="accent-[#0047CC] w-4 h-4"
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                  />
                  <span className="text-[14px] font-medium text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Textarea 
              label={<>Additional details <span className="font-normal text-gray-400 ml-1">(required, min {REJECTION_DETAILS_MIN_LENGTH} characters)</span></>}
              rows={5}
              placeholder="Provide specific, documented details to support this rejection. This is reviewed by VORA and held in the audit trail."
              value={details}
              onChange={(e) => handleDetailsChange(e.target.value)}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <div>
                {isFlagged && (
                  <div className="flex items-center gap-2 text-[#DC2626] text-[12px] font-medium animate-in fade-in slide-in-from-top-1">
                    <AlertTriangleIcon size={14} />
                    Your details appear to reference competency or interview-related criteria already verified by VORA. This will trigger a review.
                  </div>
                )}
              </div>
              <span className={`text-[11px] font-medium ${details.trim().length >= REJECTION_DETAILS_MIN_LENGTH ? 'text-gray-400' : 'text-amber-500'}`}>
                {details.trim().length} / {REJECTION_DETAILS_MIN_LENGTH} min
              </span>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[13px] text-red-700 font-medium">
              {submitError}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
              All rejection data is logged with a timestamp in the audit trail. If a Final Alignment Session occurred, the session recording will be reviewed alongside this submission.
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button 
              variant="outline" 
              fullWidth={false}
              onClick={() => navigate(-1)}
              className="px-6 min-h-[44px] border-none text-gray-500 hover:text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              variant="secondary"
              fullWidth={false}
              disabled={!isFormValid || rejectMutation.isPending}
              onClick={handleSubmit}
              className={`px-8 min-h-[44px] transition-all ${
                isFormValid 
                  ? 'bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-lg shadow-red-500/20' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {rejectMutation.isPending ? 'Submitting…' : 'Submit Rejection'}
            </Button>
          </div>
        </div>
      )}

      {step === 'flagged' && (
        <div className="bg-white border-2 border-[#DC2626] rounded-2xl p-8 shadow-xl space-y-8 animate-in zoom-in duration-300">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border-2 border-[#FECACA] flex items-center justify-center">
            <AlertTriangleIcon size={24} className="text-[#DC2626]" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-gray-900 ">Rejection Flagged for Review</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
              Your rejection documentation references criteria that overlap with competencies already verified through VORA's three-stage interview. This has been automatically flagged for review by the VORA compliance team.
            </p>
          </div>

          <div className="bg-[#FEF2F2] rounded-xl p-6 space-y-4">
            <h4 className="text-[12px] font-medium text-[#DC2626] uppercase tracking-wider">What this means</h4>
            <ul className="space-y-3">
              {[
                'The escrow will not be released until the review concludes',
                'The session recording (if applicable) will be examined',
                'The VORA compliance team will contact you within 48 hours',
                'If the rejection is found to be without documented cause, the session deposit is forfeited'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[13px] font-medium text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[13px] text-red-700 font-medium">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-4">
            <Button 
              variant="outline"
              fullWidth={false}
              onClick={() => setStep('form')}
              className="px-6 min-h-[44px] border-none text-gray-500 hover:text-gray-700"
            >
              Edit Submission
            </Button>
            <Button 
              fullWidth={false}
              disabled={rejectMutation.isPending}
              onClick={handleSubmit}
              className="px-8 min-h-[44px] bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-all shadow-lg shadow-red-500/20"
            >
              {rejectMutation.isPending ? 'Submitting…' : 'Proceed Anyway'}
            </Button>
          </div>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm text-center space-y-8 animate-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center mx-auto">
            <CheckIcon size={32} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-gray-900 ">Rejection Submitted</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium max-w-sm mx-auto">
              {applicantId || 'The applicant'} has been moved to your Rejected pipeline. The candidate has been notified and the rejection documentation has been logged in your audit trail.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/talents')}
            fullWidth={false}
            className="px-10 min-h-[56px] text-[15px] mx-auto"
          >
            Return to Talents
          </Button>
        </div>
      )}
    </div>
  );
};

export default Rejection;
