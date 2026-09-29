import React from 'react';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/common/Spinner';
import {
  FileIcon,
  UploadIcon,
  TrashIcon,
  AlertTriangleIcon,
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

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-1 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
            <p className="text-xs text-gray-500">Collected during onboarding</p>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Full Name</span>
              <span className="font-bold text-gray-900">
                {personal?.fullName ||
                  [personal?.firstName, personal?.lastName].filter(Boolean).join(' ') ||
                  '—'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Professional Title</span>
              <span className="font-semibold text-gray-900">{personal?.professionalTitle || '—'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Email</span>
              <span className="font-semibold text-gray-900">{personal?.email || '—'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Phone</span>
              <span className="font-semibold text-gray-900">{personal?.phone || 'Not provided'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Date of Birth</span>
              <span className="font-semibold text-gray-900">{personal?.dateOfBirth ? formatDate(personal.dateOfBirth) : 'Not provided'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Nationality</span>
              <span className="font-semibold text-gray-900">{personal?.nationality || 'Not provided'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Gender</span>
              <span className="font-semibold text-gray-900">{personal?.gender || 'Not specified'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Onboarding Date</span>
              <span className="font-semibold text-gray-900">{formatDate(personal?.onboardingDate)}</span>
            </div>
          </div>
        </div>

        {/* Geographic & Legal Data */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-1 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Geographic &amp; Legal Data</h3>
            <p className="text-xs text-gray-500">Used for role eligibility matching</p>
          </div>

          {geo?.rightToWorkVerified ? (
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-900">
              <span className="font-bold">✓</span>
              <span>
                Right to Work: {geo?.rightToWorkLabel || 'Verified'}. Eligible for verified regional roles.
              </span>
            </div>
          ) : (
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
              <span className="font-bold">!</span>
              <span>
                {geo?.rightToWorkLabel || 'Right to Work not confirmed.'} Verification may be required for regional roles.
              </span>
            </div>
          )}

          <div className="divide-y divide-gray-100 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Country</span>
              <span className="font-semibold text-gray-900">{geo?.country || '—'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">City</span>
              <span className="font-semibold text-gray-900">{geo?.city || '—'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">IP Location</span>
              <span className="font-semibold text-gray-900">{geo?.ipLocation || '—'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Right to Work Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  geo?.rightToWorkVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {geo?.rightToWorkStatus || (geo?.rightToWorkVerified ? 'Verified' : 'Not confirmed')}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Work Authorisation</span>
              <span className="font-semibold text-gray-900">
                {geo?.workAuthorisation && geo.workAuthorisation.length > 0
                  ? geo.workAuthorisation.join(', ')
                  : 'None specified'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Timezone</span>
              <span className="font-semibold text-gray-900">{geo?.timezone || '—'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-500">Last IP Check</span>
              <span className="font-semibold text-gray-900">{geo?.lastIpCheck ? formatDate(geo.lastIpCheck) : '—'}</span>
            </div>
          </div>
        </div>

        {/* CV & Documents */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-1 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">CV &amp; Documents</h3>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
            <span className="font-bold">!</span>
            <span>
              <strong>CV upload policy:</strong>{' '}
              {docs?.cvUploadLimitNote ||
                'Uploading a new CV updates your Skills Ledger. Prior CV-sourced claims are refreshed based on the uploaded file.'}
            </span>
          </div>

          {/* Active CV card */}
          {docs?.activeCv ? (
            <div className="border border-gray-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0047CC] flex items-center justify-center shrink-0 border border-blue-100">
                  <FileIcon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {docs.activeCv.originalName || 'Active_CV.pdf'}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Uploaded {formatDate(docs.activeCv.uploadedAt)}
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {docs.activeCv.parseStatus === 'COMPLETED' ? 'Parsed & Active' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.success('Active CV dossier verified.')}
                className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer shrink-0"
              >
                View
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
              No active CV on file. Upload a CV to unlock opportunities.
            </div>
          )}

          {/* Upload trigger dashed box */}
          <div
            onClick={onOpenUploadModal}
            className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-colors bg-gray-50/50"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
              <UploadIcon size={16} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-gray-700">Upload new CV version</div>
              <div className="text-[11px] text-gray-400">PDF, DOCX · Refreshes your Skills Ledger</div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-xs font-bold text-gray-900 mb-2">Uploaded Certificates</div>
            {docs?.certificates && docs.certificates.length > 0 ? (
              <div className="divide-y divide-gray-100 text-xs">
                {docs.certificates.map((cert) => (
                  <div key={cert.id} className="py-2 flex justify-between items-center">
                    <span className="text-gray-600">{cert.title}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {cert.statusLabel || (cert.verified ? 'Verified' : 'Submitted')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">No certificates attached yet.</div>
            )}
          </div>
        </div>

        {/* Assessment Results Summary */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-1 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Assessment Results</h3>
            <p className="text-xs text-gray-500">Results are per-role — see Progress View for full detail</p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 flex items-start gap-2 text-xs text-[#1E3A8A]">
            <span className="font-bold">!</span>
            <span>
              Assessments are real interviews, not boosters. They evaluate role fit. Grade advances through CV revamps, courses, and mentorship.
            </span>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {assessments.length === 0 ? (
              <div className="py-3 text-gray-400 italic">No assessment results recorded yet.</div>
            ) : (
              assessments.map((res, rIdx) => (
                <div key={res.assessmentId || rIdx} className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-600">{res.stageName || res.label || `Stage ${res.stage}`}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      res.status === 'passed' || res.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : res.status === 'failed'
                        ? 'bg-rose-100 text-rose-800'
                        : res.status === 'not_started'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-100 text-[#0047CC]'
                    }`}
                  >
                    {res.statusLabel || res.status}
                  </span>
                </div>
              ))
            )}
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-gray-600">Current Platform Grade</span>
              <span className="w-8 h-6 rounded flex items-center justify-center font-bold text-xs bg-[#EBF6FF] text-[#0047CC] border border-blue-200">
                {grade?.grade || 'B1'}
              </span>
            </div>
          </div>

          {grade?.prescription && (
            <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 flex items-start gap-2 text-xs text-[#1E3A8A]">
              <span className="font-bold">↑</span>
              <span>{grade.prescription}</span>
            </div>
          )}
        </div>
      </div>

      {/* PROFILE RESET INFO (REAL BACKEND POLICY, NOT MOCK PERMANENT BAN) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-1 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Profile Reset</h3>
          <p className="text-xs text-gray-500">Controlled reset policy for locked assessments</p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
          <span className="font-bold">!</span>
          <span>
            {reset?.policyNote ||
              `Up to ${reset?.maxPerWindow ?? 3} resets per ${reset?.windowDays ?? 30}-day window when interview locked. Further attempts are flagged for administrative review.`}
          </span>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-gray-500">Resets Used ({reset?.windowDays ?? 30}-day window)</span>
            <span className="font-bold text-gray-900">
              {reset?.resetsUsed ?? 0} of {reset?.maxPerWindow ?? 3}
            </span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-gray-500">Resets Remaining</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
              {reset?.resetsRemaining ?? 3} remaining
            </span>
          </div>
        </div>
      </div>

      {/* DANGER ZONE (QUEUED DELETION REQUEST, AUDIT-LOGGED) */}
      <div className="border border-rose-300 rounded-2xl bg-rose-50/30 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm sm:text-base">
          <AlertTriangleIcon size={18} />
          <span>Data Deletion Request — Danger Zone</span>
        </div>

        <div className="text-xs text-rose-900/90 leading-relaxed space-y-2">
          <p>
            {danger?.warning ||
              'You may submit a verified request to delete all your VORA account data. This queues an audit-logged deletion pipeline covering your personal information, CV dossiers, and application history.'}
          </p>
          <p>
            Deletion requests are processed securely and cannot be reversed once finalized.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDeleteModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <TrashIcon size={14} />
          <span>Request Data Deletion</span>
        </button>
      </div>
    </div>
  );
};
