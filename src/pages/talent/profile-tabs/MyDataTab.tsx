import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/common/Spinner';
import Tag from '../../../components/common/Tag';
import DateInput from '../../../components/common/DateInput';
import {
  FileIcon,
  UploadIcon,
  TrashIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  PlusIcon,
  CloseIcon,
} from '../../../components/common/Icons';
import type { TalentMyDataData } from '../../../services/queries/talent';
import {
  useUploadCertificateMutation,
  useProfileResetRequestMutation,
} from '../../../services/queries/talent';

interface MyDataTabProps {
  data?: TalentMyDataData;
  isLoading?: boolean;
  isJourneyLocked?: boolean;
  onOpenUploadModal: () => void;
  onOpenDeleteModal: () => void;
}

export const MyDataTab: React.FC<MyDataTabProps> = ({
  data,
  isLoading,
  isJourneyLocked = false,
  onOpenUploadModal,
  onOpenDeleteModal,
}) => {
  const uploadCertMutation = useUploadCertificateMutation();
  const resetMutation = useProfileResetRequestMutation();
  const certFileInputRef = useRef<HTMLInputElement>(null);

  // Certificate upload modal state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certTitle, setCertTitle] = useState('');
  const [certIssuingOrg, setCertIssuingOrg] = useState('');
  const [certIssueDate, setCertIssueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Profile reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetReason, setResetReason] = useState('Interview locked after a failed stage');

  const personal = data?.personal;
  const geo = data?.geographicLegal;
  const docs = data?.documents;
  const assessments = data?.assessmentResults || [];
  const grade = data?.grade;
  const reset = data?.profileReset;
  const danger = data?.dangerZone;

  const formatDate = (val?: string | null) => {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime())
      ? val
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getAssessmentTagVariant = (status?: string): 'green' | 'blue' | 'yellow' | 'gray' | 'red' => {
    const s = status?.toLowerCase() || '';
    if (s === 'passed' || s === 'completed' || s === 'verified') return 'green';
    if (s === 'in_progress' || s === 'invited' || s === 'current' || s === 'target') return 'blue';
    if (s === 'pending' || s === 'warning' || s === 'not_confirmed') return 'yellow';
    if (s === 'not_started' || s === 'locked' || s === 'upcoming') return 'gray';
    if (s === 'failed') return 'red';
    return 'blue';
  };

  const handleCertFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File size exceeds 10MB limit. Please choose a file up to 10MB.');
      if (certFileInputRef.current) certFileInputRef.current.value = '';
      return;
    }
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Please upload a PDF, PNG, JPG, or WEBP file.');
      if (certFileInputRef.current) certFileInputRef.current.value = '';
      return;
    }
    setCertFile(file);
  };

  const handleUploadCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certFile) {
      toast.error('Please choose a certificate file to upload.');
      return;
    }
    if (!certTitle.trim()) {
      toast.error('Please enter the certificate title.');
      return;
    }
    if (!certIssuingOrg.trim()) {
      toast.error('Please enter the issuing organisation.');
      return;
    }
    if (!certIssueDate) {
      toast.error('Please specify the issue date.');
      return;
    }

    try {
      const res = await uploadCertMutation.mutateAsync({
        file: certFile,
        title: certTitle.trim(),
        issuingOrg: certIssuingOrg.trim(),
        issueDate: certIssueDate,
      });
      toast.success(res?.message || 'Certificate uploaded and submitted for audit.');
      setIsCertModalOpen(false);
      setCertFile(null);
      setCertTitle('');
      setCertIssuingOrg('');
      if (certFileInputRef.current) certFileInputRef.current.value = '';
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload certificate.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetReason.trim()) {
      toast.error('Please provide a reason for the reset request.');
      return;
    }

    try {
      const res = await resetMutation.mutateAsync({ reason: resetReason.trim() });
      const dataPayload = res?.data;
      if (dataPayload?.success) {
        toast.success(dataPayload?.message || res?.message || 'Profile reset applied.');
      } else {
        toast.error(dataPayload?.message || res?.message || 'Profile reset request flagged for review.');
      }
      setIsResetModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to apply profile reset.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Personal Info & Geographic/Legal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">Collected during onboarding</p>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-900">
                  {personal?.fullName ||
                    [personal?.firstName, personal?.lastName].filter(Boolean).join(' ') ||
                    '—'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Professional Title</span>
                <span className={personal?.professionalTitle ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {personal?.professionalTitle || '—'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Email</span>
                <span className={personal?.email ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {personal?.email || '—'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Phone</span>
                <span className={personal?.phone ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {personal?.phone || 'Not provided'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Date of Birth</span>
                <span className={personal?.dateOfBirth ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {personal?.dateOfBirth ? formatDate(personal.dateOfBirth) : 'Not provided'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Nationality</span>
                <span className={personal?.nationality ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {personal?.nationality || 'Not provided'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Gender</span>
                <span className={personal?.gender ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {personal?.gender || 'Not specified'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Onboarding Date</span>
                <span className="font-medium text-slate-900">{formatDate(personal?.onboardingDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic & Legal Data */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Geographic &amp; Legal Data</h3>
              <p className="text-xs text-slate-500 mt-0.5">Used for role eligibility matching</p>
            </div>

            {geo?.rightToWorkProfileStatus === 'verified' || geo?.rightToWorkVerified ? (
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                <CheckCircleIcon size={16} className="text-[#0047CC] shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-slate-900">Right to Work:</strong> Verified. Eligible for verified regional roles.
                </span>
              </div>
            ) : geo?.rightToWorkProfileStatus === 'pending' ? (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
                <AlertTriangleIcon size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-amber-950">Right to Work:</strong> Verification pending review.
                </span>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                <InfoIcon size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-slate-900">Right to Work:</strong> Not set. Verification may be required for regional roles.
                </span>
              </div>
            )}

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Country</span>
                <span className={geo?.country ? 'font-medium text-slate-900' : 'text-slate-400'}>{geo?.country || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">City</span>
                <span className={geo?.city ? 'font-medium text-slate-900' : 'text-slate-400'}>{geo?.city || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">IP Location</span>
                <span className={geo?.ipLocation ? 'font-medium text-slate-900' : 'text-slate-400'}>{geo?.ipLocation || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Right to Work Status</span>
                <Tag
                  variant={
                    (geo?.rightToWorkProfileStatus === 'verified' || geo?.rightToWorkVerified)
                      ? 'green'
                      : geo?.rightToWorkProfileStatus === 'pending'
                      ? 'yellow'
                      : 'gray'
                  }
                  label={
                    geo?.rightToWorkProfileStatus === 'verified'
                      ? 'Right to Work verified'
                      : geo?.rightToWorkProfileStatus === 'pending'
                      ? 'Right to Work pending'
                      : geo?.rightToWorkProfileStatus === 'not_set'
                      ? 'Right to Work not set'
                      : geo?.rightToWorkStatus || 'Not confirmed'
                  }
                />
              </div>
              {geo?.rightToWorkDocumentUrl && (
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-500">Verification Document</span>
                  <a
                    href={geo.rightToWorkDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0047CC] hover:underline"
                  >
                    View Document ↗
                  </a>
                </div>
              )}
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Work Authorisation</span>
                <span className={geo?.workAuthorisation && geo.workAuthorisation.length > 0 ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {geo?.workAuthorisation && geo.workAuthorisation.length > 0
                    ? geo.workAuthorisation.join(', ')
                    : 'None specified'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Timezone</span>
                <span className={geo?.timezone ? 'font-medium text-slate-900' : 'text-slate-400'}>{geo?.timezone || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Last IP Check</span>
                <span className={geo?.lastIpCheck ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {geo?.lastIpCheck ? formatDate(geo.lastIpCheck) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: CV & Documents and Assessment Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* CV & Documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">CV &amp; Documents</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage CV dossiers and verified credential proofs</p>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <AlertTriangleIcon size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong className="font-semibold text-amber-950">CV upload policy:</strong>{' '}
                {docs?.cvUploadLimitNote ||
                  'Uploading a new CV updates your Skills Ledger. Prior CV-sourced claims are refreshed based on the uploaded file.'}
              </span>
            </div>

            {/* Active CV card */}
            {docs?.activeCv ? (
              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0047CC] flex items-center justify-center shrink-0 border border-blue-100">
                    <FileIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {docs.activeCv.originalName || 'Active_CV.pdf'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Uploaded {formatDate(docs.activeCv.uploadedAt)}
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <Tag
                        variant="green"
                        label={docs.activeCv.parseStatus === 'COMPLETED' ? 'Parsed & Active' : 'Active'}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!docs.activeCv.downloadUrl}
                  onClick={() => {
                    if (docs.activeCv?.downloadUrl) {
                      window.open(docs.activeCv.downloadUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${
                    docs.activeCv.downloadUrl
                      ? 'border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer'
                      : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-60'
                  }`}
                  title={docs.activeCv.downloadUrl ? 'Open active CV document' : 'Download link unavailable'}
                >
                  View
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                No active CV on file. Upload a CV to unlock opportunities.
              </div>
            )}

            {/* Upload trigger dashed box */}
            <div
              onClick={onOpenUploadModal}
              className="border-2 border-dashed border-slate-200 hover:border-[#0047CC] hover:bg-blue-50/20 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer transition-all duration-200 bg-slate-50/40"
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <UploadIcon size={16} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">Upload new CV version</div>
                <div className="text-[11px] text-slate-500">PDF, DOCX · Refreshes your Skills Ledger</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-900">Uploaded Certificates</div>
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="text-xs font-semibold text-[#0047CC] hover:text-[#003bb5] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <PlusIcon size={12} />
                  <span>Upload Certificate</span>
                </button>
              </div>

              {docs?.certificates && docs.certificates.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {docs.certificates.map((cert) => {
                    const certUrl = cert.downloadUrl || cert.shareableUrl;
                    return (
                      <div key={cert.id} className="py-2.5 flex justify-between items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-slate-800 font-medium truncate">{cert.title}</div>
                          {cert.issuingOrg && (
                            <div className="text-[11px] text-slate-500">{cert.issuingOrg}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Tag
                            variant={cert.verified ? 'green' : 'blue'}
                            label={cert.statusLabel || (cert.verified ? 'Verified' : 'Submitted for Audit')}
                          />
                          {certUrl ? (
                            <a
                              href={certUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-[#0047CC] transition-colors"
                            >
                              View
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-medium text-slate-400 cursor-not-allowed opacity-60"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">No certificates attached yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Assessment Results Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Assessment Results</h3>
              <p className="text-xs text-slate-500 mt-0.5">Results are per-role — see Progress View for full detail</p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
              <InfoIcon size={16} className="text-[#0047CC] shrink-0 mt-0.5" />
              <span>
                Assessments are real interviews, not boosters. They evaluate role fit. Grade advances through CV revamps, courses, and mentorship.
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {assessments.length === 0 ? (
                <div className="py-3 text-slate-400 italic">No assessment results recorded yet.</div>
              ) : (
                assessments.map((res, rIdx) => (
                  <div key={res.assessmentId || rIdx} className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600">{res.stageName || res.label || `Stage ${res.stage}`}</span>
                    <Tag
                      variant={getAssessmentTagVariant(res.status)}
                      label={res.statusLabel || res.status}
                    />
                  </div>
                ))
              )}
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600">Current Platform Grade</span>
                <span className="w-8 h-6 rounded-md flex items-center justify-center font-bold text-xs bg-blue-50 text-[#0047CC] border border-blue-200">
                  {grade?.grade || 'B1'}
                </span>
              </div>
            </div>

            {grade?.prescription && (
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                <InfoIcon size={16} className="text-[#0047CC] shrink-0 mt-0.5" />
                <span>{grade.prescription}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROFILE RESET INFO */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Profile Reset</h3>
            <p className="text-xs text-slate-500 mt-0.5">Controlled reset policy for locked assessments</p>
          </div>
          {isJourneyLocked && (
            <Tag variant="red" label="Interview Locked" />
          )}
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <AlertTriangleIcon size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            {reset?.policyNote ||
              `Up to ${reset?.maxPerWindow ?? 3} resets per ${reset?.windowDays ?? 30}-day window when interview locked. Further attempts are flagged for administrative review.`}
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-500">Resets Used ({reset?.windowDays ?? 30}-day window)</span>
            <span className="font-semibold text-slate-900">
              {reset?.resetsUsed ?? 0} of {reset?.maxPerWindow ?? 3}
            </span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-500">Resets Remaining</span>
            <Tag
              variant="yellow"
              label={`${reset?.resetsRemaining ?? 3} remaining`}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={!isJourneyLocked || resetMutation.isPending}
            onClick={() => setIsResetModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isJourneyLocked
                ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title={
              isJourneyLocked
                ? 'Request a profile reset for locked assessments'
                : 'Profile reset is only available to talent with a locked interview'
            }
          >
            {resetMutation.isPending && <Spinner size={12} />}
            <span>Request Profile Reset</span>
          </button>
          {!isJourneyLocked && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              Profile reset is only available to talent with a locked interview.
            </p>
          )}
        </div>
      </div>

      {/* DANGER ZONE (QUEUED DELETION REQUEST, AUDIT-LOGGED) */}
      <div className="bg-white rounded-xl border border-rose-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 text-rose-700 font-semibold text-base">
          <AlertTriangleIcon size={18} className="text-rose-600 shrink-0" />
          <span>Data Deletion Request — Danger Zone</span>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
          <p>
            {danger?.warning ||
              'You may submit a verified request to delete all your VORA account data. This queues an audit-logged deletion pipeline covering your personal information, CV dossiers, and application history.'}
          </p>
          <p>
            Deletion requests are processed securely and cannot be reversed once finalized.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onOpenDeleteModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <TrashIcon size={14} />
            <span>Request Data Deletion</span>
          </button>
        </div>
      </div>

      {/* MODAL: UPLOAD CERTIFICATE (POST /api/v1/talent/profile/certificates) */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Upload Certificate</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit credentials for audit verification (PDF, PNG, JPG, or WEBP up to 10MB)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadCertSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Certificate Document (PDF, PNG, JPG, WEBP — Max 10MB) *
                </label>
                <input
                  type="file"
                  ref={certFileInputRef}
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleCertFileSelected}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#0047CC] hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCP Professional Data Engineer"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Issuing Organisation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={certIssuingOrg}
                    onChange={(e) => setCertIssuingOrg(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                  />
                </div>
                <div>
                  <DateInput
                    label="Issue Date *"
                    labelClassName="block font-semibold text-slate-700 mb-1"
                    required
                    value={certIssueDate}
                    onChange={(e) => setCertIssueDate(e.target.value)}
                    iconPosition="right"
                    className="!w-full !px-3 !py-2 !rounded-lg !border-slate-200 !text-xs !text-slate-900 focus:!border-[#0047CC] !bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={uploadCertMutation.isPending}
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadCertMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {uploadCertMutation.isPending && <Spinner size={12} />}
                  <span>Upload Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROFILE RESET CONFIRMATION (POST /api/v1/talent/profile/reset-request) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangleIcon size={18} />
                <h3 className="text-base font-semibold text-slate-900">Request Profile Reset</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Important note regarding reset:</p>
              <p>
                Resetting clears current assessment locks and restarts the assessment journey.
                You have <strong>{reset?.resetsRemaining ?? 3}</strong> resets remaining in this window.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Reset *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  placeholder="Explain why you are requesting a reset..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={resetMutation.isPending}
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {resetMutation.isPending && <Spinner size={12} />}
                  <span>Confirm Profile Reset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

