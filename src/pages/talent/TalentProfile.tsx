import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeftIcon,
  PlayIcon,
  CloseIcon,
  LocationIcon,
  BriefcaseIcon,
  CheckIcon,
  AlertTriangleIcon,
} from '../../components/common/Icons';
import Tag from '../../components/common/Tag';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import { toast } from 'react-hot-toast';
import RequestAlignmentSessionModal from '../../components/employer/RequestAlignmentSessionModal';
import {
  useEmployerReportQuery,
  useEmployerDecideHireMutation,
  useEmployerDecideRejectMutation,
} from '../../services/queries/assessments';
import type {
  EmployerReportData,
  EmployerReportStage,
} from '../../services/queries/assessments/types';

const TalentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rolePostingId = searchParams.get('rolePostingId') || undefined;
  const assessmentIdFromQuery = searchParams.get('assessmentId') || undefined;
  const effectiveAssessmentId = assessmentIdFromQuery || id || '';

  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeVideo, setActiveVideo] = useState<{ title?: string; videoUrl: string } | null>(null);

  // Query candidate report: GET /api/v1/assessments/:assessmentId/employer-report?rolePostingId=<uuid>
  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useEmployerReportQuery(effectiveAssessmentId, rolePostingId, {
    enabled: Boolean(effectiveAssessmentId),
  });

  const errorMessage = (error as any)?.message;

  const hireMutation = useEmployerDecideHireMutation();
  const rejectMutation = useEmployerDecideRejectMutation();

  // Resolved identity fields
  const applicantCode = report?.applicantCode || id || 'APP-VORA-001';
  const professionalTitle = report?.profile?.professionalTitle || report?.talentName || 'Candidate';
  const location = report?.profile?.location || report?.talentCountry || 'Not specified';
  const yearsExp = report?.profile?.yearsOfExperience
    ? typeof report.profile.yearsOfExperience === 'number'
      ? `${report.profile.yearsOfExperience} years`
      : report.profile.yearsOfExperience
    : '—';
  const appliedJob = report?.roleTitle || 'Role Listing';
  const appliedOn = report?.appliedOn || '—';
  const status = report?.status || 'Pending review';

  // Resolved readiness flag per handoff spec
  const isInterviewReady = Boolean(report?.interviewReady);

  // Resolved interview overview stages
  const interviewOverview = report?.interviewOverview;
  const stages: EmployerReportStage[] = interviewOverview?.stages || [];

  const overallScore = interviewOverview?.overallScore ?? (
    stages.length > 0
      ? Math.round(stages.reduce((acc, curr) => acc + (curr.score || 0), 0) / stages.length)
      : 0
  );

  // Profile dossier
  const about = report?.profile?.about;
  const skills = report?.profile?.skills || [];
  const experience = report?.profile?.experience || [];
  const education = report?.profile?.education || [];
  const certifications = report?.profile?.certifications || [];
  const videos = report?.videos || [];

  // Handlers for decisions
  const handleHireSubmit = async () => {
    if (!effectiveAssessmentId || !isInterviewReady) return;
    try {
      await hireMutation.mutateAsync({ assessmentId: effectiveAssessmentId });
      toast.success(`Candidate ${applicantCode} successfully confirmed for hire!`);
      setIsHireModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to confirm hire. Please try again.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!effectiveAssessmentId || !isInterviewReady) return;
    try {
      await rejectMutation.mutateAsync({
        assessmentId: effectiveAssessmentId,
        kind: 'LEGITIMATE',
        reason: rejectReason.trim() || undefined,
      });
      toast.success(`Candidate ${applicantCode} has been rejected.`);
      setIsRejectModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject applicant. Please try again.');
    }
  };

  const mapStatusVariant = (s?: string): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
    const lower = (s || '').toLowerCase();
    if (lower.includes('hired') || lower.includes('pass')) return 'green';
    if (lower.includes('reject')) return 'red';
    if (lower.includes('align') || lower.includes('review')) return 'yellow';
    return 'blue';
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1360px] mx-auto px-4 sm:px-6">
      {/* Top Back Navigation */}
      <div className="pt-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2.5 text-gray-900 hover:text-[#0047CC] transition-colors cursor-pointer bg-transparent border-none p-0 group font-bold text-[18px]"
        >
          <ChevronLeftIcon size={20} strokeWidth={2.5} className="text-gray-700 transition-transform group-hover:-translate-x-1" />
          <span>{applicantCode}</span>
        </button>

        <span className="text-[12px] font-medium text-slate-400">
          Applicant Dossier
        </span>
      </div>

      {isError && !report?.profile && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-800 text-[13px]">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon size={16} className="text-amber-600 shrink-0" />
            <span>
              {errorMessage
                ? `${errorMessage}.`
                : `Could not load live candidate report for ${applicantCode}.`}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="font-semibold text-amber-900 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Identity & Application, Interview Overview, Video, Decisions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity & Applied Job Card */}
          <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100/80 text-[#0047CC] flex items-center justify-center font-bold text-lg shrink-0">
                {applicantCode.slice(0, 2)}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h2 className="text-[19px] font-bold text-gray-900 leading-tight truncate">
                  {applicantCode}
                </h2>
                <p className="text-[13px] text-gray-600 font-medium truncate">{professionalTitle}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-0.5 font-normal">
                  <span className="flex items-center gap-1 truncate">
                    <LocationIcon size={12} className="text-gray-400 shrink-0" />
                    {location}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <BriefcaseIcon size={12} className="text-gray-400 shrink-0" />
                    {yearsExp}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#F0F2F5] rounded-[16px] p-4 space-y-2.5">
              <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
                <span>Applied Job</span>
                <span>{appliedOn}</span>
              </div>
              <p className="text-[13px] font-bold text-gray-900 leading-snug">
                {appliedJob}
              </p>
              <div className="flex items-center gap-2 pt-0.5 text-[12px]">
                <span className="text-gray-500 font-normal">Status:</span>
                <Tag label={status} variant={mapStatusVariant(status)} />
              </div>
            </div>
          </div>

          {/* Interview Overview & Videos (Only when interviewReady === true) */}
          {isInterviewReady ? (
            <>
              {/* Interview Overview */}
              <div className="space-y-3">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Interview overview</h3>

                <div className="space-y-3">
                  {/* Overall Score Card */}
                  <div className="bg-[#EFF6FF] p-5 rounded-[18px] border border-blue-100/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-gray-700">Overall Interview Score</p>
                      <span className="text-[10.5px] text-gray-400 font-medium">Avg (Stages 1–3)</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-[34px] font-bold text-gray-900 leading-none tabular-nums">
                        {overallScore}%
                      </span>
                    </div>
                  </div>

                  {/* Stage Breakdown */}
                  {stages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {stages.map((st, idx) => (
                        <div
                          key={st.stage || idx}
                          className="bg-white border border-gray-100 rounded-[14px] p-3.5 space-y-1 hover:border-gray-200 transition-colors shadow-2xs"
                        >
                          <p className="text-[11px] font-medium text-gray-500 line-clamp-1" title={st.label || st.stageName}>
                            {st.label || `Stage ${st.stage}`}
                          </p>
                          <div className="flex items-baseline justify-between pt-0.5">
                            <span className="text-[19px] font-bold text-gray-900 leading-none tabular-nums">
                              {st.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stage 3 Video Interview Uploads */}
              <div className="space-y-3">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Interview Video</h3>

                {videos.length > 0 ? (
                  <div className="space-y-2.5">
                    {videos.map((vid, vIdx) => (
                      <div
                        key={vid.itemId || vIdx}
                        onClick={() => setActiveVideo(vid)}
                        className="relative aspect-video rounded-[18px] overflow-hidden group cursor-pointer shadow-xs border border-gray-100 bg-slate-900"
                      >
                        <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/60 transition-colors flex flex-col justify-between p-4 z-10">
                          <span className="text-white text-[12px] font-medium bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md self-start">
                            {vid.title || `Stage 3 Response ${vIdx + 1}`}
                          </span>
                          <div className="self-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                            <PlayIcon size={20} className="text-white ml-0.5 fill-white" />
                          </div>
                          <span className="text-white/80 text-[11px] self-end">Click to play video</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-[18px] bg-gray-50 border border-gray-100 text-center text-[12px] text-gray-400">
                    No video interview recording submitted
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-[20px] p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <h3 className="text-[14px] font-bold">Interview In Progress</h3>
              </div>
              <p className="text-[12.5px] text-slate-500 leading-relaxed">
                This candidate has not reached the employer decision stage yet. Interview scores, recordings, and narrative will appear here once Stage 4 is completed.
              </p>
            </div>
          )}

          {/* Action Buttons (Hire, Request Alignment, Reject) */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={!isInterviewReady || hireMutation.isPending}
              onClick={() => setIsHireModalOpen(true)}
              className="w-full py-3 px-6 bg-[#0052CC] hover:bg-[#0047CC] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full font-semibold text-[15px] shadow-xs cursor-pointer transition-all active:scale-[0.99]"
            >
              Hire applicant
            </button>
            <button
              type="button"
              disabled={!isInterviewReady}
              onClick={() => setIsAlignmentModalOpen(true)}
              className="w-full py-3 px-6 bg-[#EFF6FF] hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-[#0052CC] border border-blue-200/80 rounded-full font-semibold text-[15px] cursor-pointer transition-all active:scale-[0.99]"
            >
              Request alignment session
            </button>
            <button
              type="button"
              disabled={!isInterviewReady || rejectMutation.isPending}
              onClick={() => setIsRejectModalOpen(true)}
              className="w-full py-3 px-6 bg-[#FAFAFA] hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 text-gray-800 rounded-full font-semibold text-[15px] cursor-pointer transition-all active:scale-[0.99]"
            >
              Reject applicant
            </button>
            {!isInterviewReady && (
              <p className="text-[11.5px] text-center text-slate-400 font-medium">
                Decision actions unlock when interview stages are completed.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Professional Dossier (About, Skills, Experience, Education, Certifications) */}
        <div className="lg:col-span-8 space-y-6">
          {/* About & Skills Card */}
          <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-7 space-y-5 shadow-xs">
            <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Professional Information</h3>

            <div className="space-y-5">
              {/* About */}
              <div className="space-y-1.5">
                <h4 className="text-[13px] font-bold text-gray-900">About</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">
                  {about || 'No detailed professional summary provided.'}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-2 pt-1">
                <h4 className="text-[13px] font-bold text-gray-900">Skills</h4>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {skills.map((skill: any, idx: number) => {
                      const label = typeof skill === 'string' ? skill : skill.label || String(skill);
                      return (
                        <span
                          key={idx}
                          className="px-3.5 py-1 rounded-full text-[12px] font-medium bg-white text-gray-700 border border-gray-200 shadow-2xs hover:bg-gray-50 transition-colors"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No skills listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom 2-Card Grid: Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Experience Card */}
            <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-7 space-y-5 flex flex-col shadow-xs">
              <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Experience</h3>

              {experience.length > 0 ? (
                <div className="relative space-y-7 pl-6 flex-1">
                  <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200" />
                  {experience.map((exp, idx) => (
                    <div key={idx} className="relative space-y-1.5">
                      <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-[#0052CC] ring-4 ring-[#FAFAFA]" />
                      <h4 className="text-[14px] font-bold text-gray-900 leading-snug">
                        {exp.title || exp.role || 'Position'}
                      </h4>
                      {exp.company && (
                        <p className="text-[12px] font-medium text-gray-700">{exp.company}</p>
                      )}
                      {(exp.period || exp.startDate) && (
                        <span className="text-[11px] font-medium text-[#0052CC] bg-[#EBF3FE] px-2.5 py-0.5 rounded-full inline-block">
                          {exp.period || `${exp.startDate} - ${exp.endDate || 'Present'}`}
                        </span>
                      )}
                      {(exp.description || exp.summary) && (
                        <p className="text-[12px] text-gray-500 leading-relaxed pt-0.5">
                          {exp.description || exp.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-gray-400 py-4">No work experience listed</p>
              )}
            </div>

            {/* Education & Certifications Card */}
            <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-7 space-y-5 flex flex-col shadow-xs">
              <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Education & Certifications</h3>

              <div className="space-y-6 flex-1">
                {/* Education */}
                <div className="space-y-4">
                  <h4 className="text-[13px] font-bold text-gray-900">Education</h4>
                  {education.length > 0 ? (
                    education.map((edu, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h5 className="text-[13px] font-bold text-gray-900 leading-snug">
                            {edu.title || edu.degree || 'Degree'}
                          </h5>
                          {(edu.period || edu.year) && (
                            <span className="text-[11px] text-gray-400 shrink-0">
                              {edu.period || edu.year}
                            </span>
                          )}
                        </div>
                        {(edu.institution || edu.school) && (
                          <p className="text-[12px] text-gray-500">
                            {edu.institution || edu.school}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[12px] text-gray-400">No education entries listed</p>
                  )}
                </div>

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-gray-200/60">
                    <h4 className="text-[13px] font-bold text-gray-900">Certifications</h4>
                    {certifications.map((cert, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <h5 className="text-[13px] font-semibold text-gray-900">
                            {cert.title || cert.name || 'Certification'}
                          </h5>
                          {(cert.period || cert.year) && (
                            <span className="text-[11px] text-gray-400 shrink-0">
                              {cert.period || cert.year}
                            </span>
                          )}
                        </div>
                        {cert.issuer && (
                          <p className="text-[12px] text-gray-500">{cert.issuer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-[15px] font-bold text-gray-900">
                {activeVideo.title || 'Stage 3 Interview Recording'}
              </h4>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="p-4 bg-black aspect-video flex items-center justify-center">
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hire Applicant Confirmation Modal */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-semibold text-gray-900">Hire applicant</h3>
              <button
                onClick={() => setIsHireModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              You are about to hire <strong className="text-[#0047CC]">{applicantCode}</strong> for <strong className="text-gray-900">{appliedJob}</strong>. This will execute the hire decision and notify the talent.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsHireModalOpen(false)}
                className="flex-1 py-3.5 px-5 rounded-full border border-gray-200 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={hireMutation.isPending}
                onClick={handleHireSubmit}
                className="flex-1 py-3.5 px-5 rounded-full bg-[#0047CC] text-white text-[15px] font-medium hover:bg-[#003d99] disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                {hireMutation.isPending ? 'Confirming...' : 'Confirm Hire'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Applicant Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-semibold text-gray-900">Reject applicant</h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              Are you sure you want to reject <strong className="text-gray-900">{applicantCode}</strong>?
            </p>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-600">Rejection reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Add feedback or justification..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-3.5 px-5 rounded-full border border-gray-200 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectMutation.isPending}
                onClick={handleRejectSubmit}
                className="flex-1 py-3.5 px-5 rounded-full bg-red-600 text-white text-[15px] font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-500/25 cursor-pointer"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Applicant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Alignment Session Modal */}
      <RequestAlignmentSessionModal
        isOpen={isAlignmentModalOpen}
        onClose={() => setIsAlignmentModalOpen(false)}
        candidateCode={applicantCode}
        assessmentId={effectiveAssessmentId}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default TalentProfile;
