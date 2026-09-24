import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseIcon, PlayIcon, LocationIcon, BriefcaseIcon, CheckIcon } from '../common/Icons';
import Tag from '../common/Tag';
import { toast } from 'react-hot-toast';
import RequestAlignmentSessionModal from './RequestAlignmentSessionModal';
import {
  useEmployerReportQuery,
  useEmployerDecideHireMutation,
  useEmployerDecideRejectMutation,
} from '../../services/queries/assessments';
import type { EmployerReportStage } from '../../services/queries/assessments/types';
import { resolveAssessmentId } from '../../utils/assessmentDecision';

interface ApplicantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: any;
  onReject?: () => void;
  onHire?: () => void;
  onViewApplicant?: () => void;
}

const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  applicant, 
  onReject, 
  onHire,
  onViewApplicant,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeVideo, setActiveVideo] = useState<{ title?: string; videoUrl: string } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const rolePostingId = applicant?.rolePostingId;
  const assessmentId = resolveAssessmentId(applicant, rolePostingId) || applicant?.assessmentId || applicant?.id;

  // Query candidate report: GET /api/v1/assessments/:assessmentId/employer-report?rolePostingId=<uuid>
  const { data: report, isLoading, refetch } = useEmployerReportQuery(assessmentId, rolePostingId, {
    enabled: Boolean(isOpen && assessmentId),
  });

  const hireMutation = useEmployerDecideHireMutation();
  const rejectMutation = useEmployerDecideRejectMutation();

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender || !applicant) return null;

  // Identity & application fields
  const code = report?.applicantCode || applicant.applicantCode || applicant.name || applicant.id || 'APP-VORA-001';
  const professionalTitle = report?.profile?.professionalTitle || applicant.qualification || applicant.academicLevel || 'Specialist';
  const location = report?.profile?.location || applicant.location || applicant.country || 'Location not specified';
  const yearsExp = report?.profile?.yearsOfExperience
    ? typeof report.profile.yearsOfExperience === 'number'
      ? `${report.profile.yearsOfExperience} years`
      : report.profile.yearsOfExperience
    : (applicant.yearsOfExperience || '—');
  const roleTitle = report?.roleTitle || applicant.roleApplied || applicant.roleTitle || 'Job Applicant';
  const appliedOn = report?.appliedOn || applicant.appliedOn || applicant.dateApplied || 'Recent';
  const status = report?.status || applicant.status || applicant.overallStatus || 'Pending review';

  // Resolved readiness flag per handoff spec
  const isInterviewReady = Boolean(report?.interviewReady ?? applicant?.interviewReady);

  // Interview overview
  const interviewOverview = report?.interviewOverview;
  const stages: EmployerReportStage[] = interviewOverview?.stages || [];

  const overallScore = interviewOverview?.overallScore ?? (
    stages.length > 0
      ? Math.round(stages.reduce((acc, curr) => acc + (curr.score || 0), 0) / stages.length)
      : (applicant.overallScore ?? 0)
  );

  // Profile dossier
  const about = report?.profile?.about || applicant.about;
  const skills = report?.profile?.skills || applicant.skills || [];
  const experience = report?.profile?.experience || applicant.experience || [];
  const education = report?.profile?.education || applicant.education || [];
  const certifications = report?.profile?.certifications || applicant.certifications || [];
  const videos = report?.videos || (applicant.videoUrl ? [{ itemId: 'video-1', title: 'Stage 3 Interview Upload', videoUrl: applicant.videoUrl }] : []);

  // Action Handlers
  const handleHireSubmit = async () => {
    if (!assessmentId || !isInterviewReady) return;
    try {
      await hireMutation.mutateAsync({ assessmentId });
      toast.success(`Candidate ${code} successfully confirmed for hire!`);
      setIsHireModalOpen(false);
      refetch();
      onHire?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to confirm hire.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!assessmentId || !isInterviewReady) return;
    try {
      await rejectMutation.mutateAsync({
        assessmentId,
        kind: 'LEGITIMATE',
        reason: rejectReason.trim() || undefined,
      });
      toast.success(`Candidate ${code} has been rejected.`);
      setIsRejectModalOpen(false);
      refetch();
      onReject?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject applicant.');
    }
  };

  const navigateToTalentProfile = () => {
    onClose();
    if (onViewApplicant) {
      onViewApplicant();
    } else {
      const qs = new URLSearchParams();
      if (assessmentId) qs.set('assessmentId', assessmentId);
      if (rolePostingId) qs.set('rolePostingId', rolePostingId);
      const queryStr = qs.toString() ? `?${qs.toString()}` : '';
      navigate(`/talents/${code}${queryStr}`);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 z-[150] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
        
        {/* Drawer Content */}
        <div 
          onAnimationEnd={handleAnimationEnd}
          className={`relative bg-white w-full max-w-[540px] h-full shadow-2xl overflow-hidden flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="px-5 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0047CC] border border-blue-100/80 flex items-center justify-center font-bold text-sm shrink-0">
                {code.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <h2 className="text-[16px] font-bold text-gray-900 leading-tight truncate">{code}</h2>
                <p className="text-[12px] font-medium text-gray-400 mt-0.5 truncate">
                  {roleTitle} · {professionalTitle}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer shrink-0 ml-2"
            >
              <CloseIcon size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 py-6 space-y-6">
            {/* Identity & Application Metadata Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-[16px] p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Applied: <strong className="text-slate-700">{appliedOn}</strong></span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0047CC] font-semibold text-[10px]">
                  {status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px] pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <LocationIcon size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{location}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Experience</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <BriefcaseIcon size={12} className="text-slate-400 shrink-0" />
                    <span>{yearsExp}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Stats Section / Status Badge */}
            {isInterviewReady ? (
              <div className="space-y-3">
                <div className="bg-[#EFF6FF] p-5 rounded-[18px] border border-blue-100/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-gray-700">Overall Interview Score</p>
                    <span className="text-[10.5px] text-gray-400 font-medium">Avg (Stages 1–3)</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[32px] font-bold text-gray-900 leading-none tabular-nums">
                      {overallScore}%
                    </span>
                  </div>
                </div>

                {/* Stage 1 to 3 Breakdown */}
                {stages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {stages.map((st, i) => (
                      <div key={st.stage || i} className="bg-white border border-gray-100 rounded-[14px] p-3 space-y-1 shadow-2xs">
                        <p className="text-[10.5px] font-medium text-gray-500 truncate" title={st.label || st.stageName}>
                          {st.stageName || `Stage ${st.stage}`}
                        </p>
                        <div className="flex items-baseline justify-between pt-0.5">
                          <span className="text-[18px] font-bold text-gray-900 leading-none tabular-nums">
                            {st.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-[16px] p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <h4 className="text-[13px] font-bold">Interview In Progress</h4>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Candidate interview metrics and recordings will appear once Stage 4 is reached.
                </p>
              </div>
            )}

            {/* Video Section */}
            {isInterviewReady && videos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Stage 3 Interview Video</h3>
                {videos.map((vid: any, idx: number) => (
                  <div 
                    key={vid.itemId || idx}
                    onClick={() => setActiveVideo(vid)}
                    className="relative aspect-video rounded-[16px] overflow-hidden group cursor-pointer shadow-xs border border-gray-100 bg-slate-900"
                  >
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/60 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform duration-300">
                        <PlayIcon size={20} className="text-white ml-0.5 fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-medium bg-black/60 px-2 py-0.5 rounded">
                      {vid.title || 'Watch interview recording'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* About Section */}
            {about && (
              <div className="space-y-2">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">About</h3>
                <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">
                  {about}
                </p>
              </div>
            )}

            {/* Skills Section */}
            {skills && skills.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any, index: number) => {
                    const label = typeof skill === 'string' ? skill : skill.label || String(skill);
                    return (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-[11px] font-medium bg-gray-50 text-gray-700 border border-gray-100"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {experience && experience.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Experience</h3>
                <div className="space-y-3">
                  {experience.map((exp: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-[13px] font-bold text-gray-900">{exp.title || exp.role}</h4>
                        {(exp.period || exp.startDate) && (
                          <span className="text-[10.5px] text-gray-400 shrink-0">
                            {exp.period || `${exp.startDate} - ${exp.endDate || 'Present'}`}
                          </span>
                        )}
                      </div>
                      {exp.company && <p className="text-[11px] font-medium text-slate-600">{exp.company}</p>}
                      {(exp.description || exp.summary) && (
                        <p className="text-[12px] text-gray-500 leading-relaxed pt-0.5">
                          {exp.description || exp.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Certifications */}
            {((education && education.length > 0) || (certifications && certifications.length > 0)) && (
              <div className="space-y-3">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Education & Certifications</h3>
                <div className="space-y-2.5">
                  {education.map((edu: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-[13px] font-bold text-gray-900">{edu.title || edu.degree}</h4>
                        {(edu.period || edu.year) && (
                          <span className="text-[10.5px] text-gray-400 shrink-0">{edu.period || edu.year}</span>
                        )}
                      </div>
                      {(edu.institution || edu.school) && (
                        <p className="text-[11px] text-gray-500">{edu.institution || edu.school}</p>
                      )}
                    </div>
                  ))}
                  {certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl space-y-0.5">
                      <h4 className="text-[13px] font-bold text-gray-900">{cert.title || cert.name}</h4>
                      {cert.issuer && <p className="text-[11px] text-gray-500">{cert.issuer}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 sm:px-8 py-4 border-t border-gray-100 bg-white space-y-2 shrink-0">
            {/* Direct Decision Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={!isInterviewReady || hireMutation.isPending}
                onClick={() => setIsHireModalOpen(true)}
                className="py-2.5 px-3 bg-[#0047CC] hover:bg-[#003bb0] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[12px] font-semibold transition-all shadow-xs cursor-pointer text-center"
              >
                Hire
              </button>
              <button
                type="button"
                disabled={!isInterviewReady}
                onClick={() => setIsAlignmentModalOpen(true)}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-[#0047CC] border border-blue-200/60 rounded-xl text-[12px] font-semibold transition-all cursor-pointer text-center"
              >
                Request align
              </button>
              <button
                type="button"
                disabled={!isInterviewReady || rejectMutation.isPending}
                onClick={() => {
                  if (onReject) {
                    onReject();
                  } else {
                    setIsRejectModalOpen(true);
                  }
                }}
                className="py-2.5 px-3 bg-gray-50 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 border border-gray-200 rounded-xl text-[12px] font-semibold transition-all cursor-pointer text-center"
              >
                Reject
              </button>
            </div>

            {/* View Full Page Shortcut */}
            <button 
              type="button"
              onClick={navigateToTalentProfile}
              className="w-full py-2 text-center text-[#0047CC] hover:underline text-[12px] font-medium bg-transparent border-none cursor-pointer"
            >
              Open complete candidate dossier →
            </button>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-[14px] font-bold text-gray-900">
                {activeVideo.title || 'Stage 3 Interview Recording'}
              </h4>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="p-3 bg-black aspect-video flex items-center justify-center">
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hire Confirmation Modal */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative">
            <h3 className="text-[18px] font-bold text-gray-900">Hire Candidate</h3>
            <p className="text-[13px] text-gray-600">
              Confirm hiring <strong className="text-[#0047CC]">{code}</strong> for <strong className="text-gray-800">{roleTitle}</strong>?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsHireModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={hireMutation.isPending}
                onClick={handleHireSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#0047CC] text-white text-[13px] font-semibold hover:bg-[#003bb0] disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {hireMutation.isPending ? 'Hiring...' : 'Confirm Hire'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative">
            <h3 className="text-[18px] font-bold text-gray-900">Reject Candidate</h3>
            <p className="text-[13px] text-gray-600">
              Are you sure you want to reject <strong className="text-gray-800">{code}</strong>?
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectMutation.isPending}
                onClick={handleRejectSubmit}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alignment Session Modal */}
      <RequestAlignmentSessionModal
        isOpen={isAlignmentModalOpen}
        onClose={() => setIsAlignmentModalOpen(false)}
        candidateCode={code}
        assessmentId={assessmentId}
        onSuccess={() => refetch()}
      />
    </>
  );
};

export default ApplicantDetailsModal;
