import React from 'react';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/common/Spinner';
import Tag from '../../../components/common/Tag';
import {
  FileIcon,
  UploadIcon,
  TrashIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
} from '../../../components/common/Icons';
import type { TalentMyDataData } from '../../../services/queries/talent';

interface MyDataTabProps {
  data?: TalentMyDataData;
  isLoading?: boolean;
  onOpenUploadModal: () => void;
  onOpenDeleteModal: () => void;
}

export const MyDataTab: React.FC<MyDataTabProps> = ({
  data,
  isLoading,
  onOpenUploadModal,
  onOpenDeleteModal,
}) => {
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

            {geo?.rightToWorkVerified ? (
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                <CheckCircleIcon size={16} className="text-[#0047CC] shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-slate-900">Right to Work:</strong>{' '}
                  {geo?.rightToWorkLabel || 'Verified'}. Eligible for verified regional roles.
                </span>
              </div>
            ) : (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
                <AlertTriangleIcon size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-amber-950">Right to Work:</strong>{' '}
                  {geo?.rightToWorkLabel || 'Right to Work not confirmed.'} Verification may be required for regional roles.
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
                  variant={geo?.rightToWorkVerified ? 'green' : 'yellow'}
                  label={geo?.rightToWorkStatus || (geo?.rightToWorkVerified ? 'Verified' : 'Not confirmed')}
                />
              </div>
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
                  onClick={() => toast.success('Active CV dossier verified.')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shrink-0 transition-colors"
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
              <div className="text-xs font-semibold text-slate-900 mb-2">Uploaded Certificates</div>
              {docs?.certificates && docs.certificates.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {docs.certificates.map((cert) => (
                    <div key={cert.id} className="py-2 flex justify-between items-center">
                      <span className="text-slate-600">{cert.title}</span>
                      <Tag
                        variant={cert.verified ? 'green' : 'blue'}
                        label={cert.statusLabel || (cert.verified ? 'Verified' : 'Submitted')}
                      />
                    </div>
                  ))}
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
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Profile Reset</h3>
          <p className="text-xs text-slate-500 mt-0.5">Controlled reset policy for locked assessments</p>
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
    </div>
  );
};

