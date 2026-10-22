import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  VideoIcon, 
  LocationIcon, 
  CheckIcon,
  AlertTriangleIcon,
  CloseIcon,
} from '../../components/common/Icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import { toast } from 'react-hot-toast';
import {
  useEmployerAlignmentSessionQuery,
  useEmployerDecideAlignMutation,
  useEmployerDecideHireMutation,
  useEmployerDecideRejectMutation,
} from '../../services/queries/assessments';

const FinalAlignmentSession: React.FC = () => {
  const { id: rolePostingId, candidateId: assessmentId } = useParams<{ id: string; candidateId: string }>();
  const navigate = useNavigate();

  // Queries & Mutations
  const { 
    data: session, 
    isLoading, 
    error, 
    refetch 
  } = useEmployerAlignmentSessionQuery(assessmentId, rolePostingId);

  const alignMutation = useEmployerDecideAlignMutation();
  const hireMutation = useEmployerDecideHireMutation();
  const rejectMutation = useEmployerDecideRejectMutation();

  // Modals state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Reschedule form state
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('10:00');
  const [slotLabel, setSlotLabel] = useState('Video Alignment Session');

  // Hire form state
  const [compensation, setCompensation] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState('');

  // Reject form state
  const [rejectKind, setRejectKind] = useState<'LEGITIMATE' | 'FRAUD'>('LEGITIMATE');
  const [rejectReason, setRejectReason] = useState('ROLE_MISMATCH');
  const [rejectDetails, setRejectDetails] = useState('');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#0047CC] border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] font-medium text-gray-500">Loading alignment session details...</p>
      </div>
    );
  }

  if (error || !session) {
    const errMessage = (error as any)?.message || 'Failed to load alignment session';
    const isNotReady = errMessage.includes('ASSESSMENT_STAGE4_ALIGNMENT_SESSION_NOT_READY');

    return (
      <div className="bg-white border border-gray-100 rounded-[24px] p-10 max-w-2xl mx-auto my-12 text-center shadow-xs">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangleIcon size={28} />
        </div>
        <h2 className="text-[20px] font-bold text-gray-900 mb-2">
          {isNotReady ? 'Alignment Session Not Ready' : 'Unable to Load Session'}
        </h2>
        <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
          {isNotReady
            ? 'No alignment invite or deposit has been locked for this candidate yet. The candidate must progress through stage 3 screenings first.'
            : errMessage}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(`/jobs/${rolePostingId}`)}>
            Back to Job Details
          </Button>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const candidate = session.candidate;
  const candidateInitials = candidate.initials || candidate.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';

  const handleSendSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate || !slotTime) {
      toast.error('Please select both a date and time');
      return;
    }
    if (!assessmentId) return;

    try {
      const startsAt = new Date(`${slotDate}T${slotTime}:00`).toISOString();
      await alignMutation.mutateAsync({
        assessmentId,
        slots: [{
          label: slotLabel.trim() || 'Video Alignment Session',
          startsAt,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }],
      });
      toast.success('Alignment session slots sent to candidate!');
      setShowRescheduleModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send slot proposal');
    }
  };

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentId) return;

    try {
      await hireMutation.mutateAsync({
        assessmentId,
        offer: {
          compensationCurrency: currency,
          finalCompensation: compensation ? parseFloat(compensation) : undefined,
          confirmedStartDate: startDate || undefined,
        },
      });
      toast.success('Hire confirmed successfully!');
      setShowHireModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to confirm hire');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentId) return;
    if (rejectDetails.trim().length < 10) {
      toast.error('Please provide at least 10 characters explaining the decision');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        assessmentId,
        kind: rejectKind,
        primaryReason: rejectReason,
        details: rejectDetails.trim(),
      });
      toast.success('Decision recorded.');
      setShowRejectModal(false);
      navigate(`/jobs/${rolePostingId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record rejection');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 text-[14px]">
        <Link to="/jobs" className="text-gray-400 hover:text-[#0047CC] transition-colors font-medium">Jobs</Link>
        <ChevronRightIcon size={14} className="text-gray-300" />
        <Link to={`/jobs/${rolePostingId}`} className="text-gray-400 hover:text-[#0047CC] transition-colors font-medium">
          {session.roleTitle || 'Job Overview'}
        </Link>
        <ChevronRightIcon size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium">Final Alignment Session</span>
      </div>

      {/* Candidate Overview Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#387DFF] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0047CC] text-white flex items-center justify-center font-bold text-[15px] shrink-0 shadow-xs">
            {candidateInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-gray-900">
                {candidate.fullName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate'}
              </h1>
              {candidate.grade && (
                <span className="px-2.5 py-0.5 bg-blue-50 text-[#0047CC] border border-blue-200/60 rounded-full text-[11px] font-bold">
                  {candidate.grade}
                </span>
              )}
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {[candidate.professionalTitle, candidate.country || session.location].filter(Boolean).join(' · ') || 'Verified Applicant'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 bg-[#EEFBEE] text-[#135813] border border-green-200/50 rounded-full text-[11px] font-bold uppercase tracking-wider">
            {session.decisionStatus || 'Alignment Stage'}
          </span>
          {session.actions?.report && (
            <Link
              to={`/jobs/${rolePostingId}/candidate/${assessmentId}/report`}
              className="text-[13px] font-medium text-[#0047CC] hover:underline px-3 py-1.5 bg-blue-50/60 rounded-lg"
            >
              View Report
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid: Session Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Scheduled Slot & Session Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alignment Meeting Card */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-xs">
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Session Logistics</h2>
            <p className="text-[13px] text-gray-400 mb-6 leading-relaxed">
              Final alignment sessions confirm cultural fit, working arrangements, and start dates. Maximum duration: {session.durationMins ?? 30} minutes.
            </p>

            {/* Scheduled Slot Status */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 mb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Scheduled Time</p>
              {session.scheduledAt ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[16px] font-bold text-gray-900">
                      {new Date(session.scheduledAt).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {session.selectedSlot?.timezone ? ` (${session.selectedSlot.timezone})` : ''}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-semibold">
                    Confirmed Slot
                  </span>
                </div>
              ) : session.slots && session.slots.length > 0 ? (
                <div>
                  <p className="text-[13px] font-medium text-amber-700 mb-2">
                    Awaiting candidate confirmation for proposed slots:
                  </p>
                  <div className="space-y-2">
                    {session.slots.map((s, idx) => (
                      <div key={s.id || idx} className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px]">
                        <span className="font-medium text-gray-800">{s.label || 'Proposed Slot'}</span>
                        <span className="text-gray-500">
                          {new Date(s.startsAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-gray-500">No time slot scheduled yet.</p>
                  <Button size="sm" onClick={() => setShowRescheduleModal(true)}>
                    Propose Slots
                  </Button>
                </div>
              )}
            </div>

            {/* Video Meeting Link */}
            <div className="border border-gray-100 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0047CC] flex items-center justify-center shrink-0">
                  <VideoIcon size={20} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-900">Virtual Meeting Room</p>
                  <p className="text-[12px] text-gray-500">Conducted securely within VORA platform</p>
                </div>
              </div>

              {session.meetingLink ? (
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#0047CC] text-white rounded-xl text-[13px] font-medium hover:bg-blue-700 transition-colors"
                >
                  Join Meeting
                </a>
              ) : (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-[12px] font-medium">
                  Link pending
                </span>
              )}
            </div>
          </div>

          {/* Session Checklist */}
          {session.checklist && session.checklist.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-xs">
              <h3 className="text-[16px] font-bold text-gray-900 mb-4">Stage 4 Alignment Checklist</h3>
              <div className="space-y-3">
                {session.checklist.map((item, idx) => (
                  <div key={item.key || idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${item.done ? 'bg-green-600' : 'bg-gray-300'}`}>
                      {item.done && <CheckIcon size={14} strokeWidth={3} />}
                    </div>
                    <span className={`text-[13px] ${item.done ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-xs space-y-4">
            <h3 className="text-[16px] font-bold text-gray-900">Employer Actions</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              You may propose new interview times, or record the final hire or rejection decision.
            </p>

            <div className="space-y-3 pt-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => setShowRescheduleModal(true)}
              >
                {session.slots?.length ? 'Reschedule / Update Slots' : 'Propose Slots'}
              </Button>

              <Button
                className="w-full justify-center bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowHireModal(true)}
              >
                Proceed to Hire
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center text-red-600 hover:bg-red-50 hover:border-red-200"
                onClick={() => setShowRejectModal(true)}
              >
                Reject Candidate
              </Button>
            </div>
          </div>

          {/* Deposit info note */}
          {session.deposit && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-[12px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">Alignment Deposit Notice</p>
              <p>
                Deposit ID: <span className="font-mono text-slate-800">{session.deposit.depositId}</span>
              </p>
              <p>
                Status: <span className="font-semibold text-slate-800">{session.deposit.status}</span> ({session.deposit.currency} {session.deposit.amount})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Reschedule / Propose Slots */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-gray-900">Propose Alignment Slot</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleSendSlots} className="space-y-4">
              <Input
                label="Session Label"
                value={slotLabel}
                onChange={(e) => setSlotLabel(e.target.value)}
                placeholder="e.g. Video Alignment Session"
              />
              <Input
                label="Proposed Date"
                type="date"
                required
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
              <Input
                label="Proposed Time"
                type="time"
                required
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
              />
              <p className="text-[12px] text-gray-500">
                Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <Button variant="secondary" type="button" onClick={() => setShowRescheduleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={alignMutation.isPending}>
                  {alignMutation.isPending ? 'Sending...' : 'Send Slot Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hire Decision */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-gray-900">Confirm Candidate Hire</h3>
              <button onClick={() => setShowHireModal(false)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleHireSubmit} className="space-y-4">
              <p className="text-[13px] text-gray-500">
                Confirming hire will close this assessment and mark the candidate as hired for this role.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    label="Final Compensation"
                    type="number"
                    placeholder="e.g. 85000"
                    value={compensation}
                    onChange={(e) => setCompensation(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
              </div>
              <Input
                label="Confirmed Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-3">
                <Button variant="secondary" type="button" onClick={() => setShowHireModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={hireMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                  {hireMutation.isPending ? 'Confirming...' : 'Confirm Hire'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reject Decision */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-gray-900">Reject Candidate</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Rejection Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="radio"
                      name="rejectKind"
                      checked={rejectKind === 'LEGITIMATE'}
                      onChange={() => setRejectKind('LEGITIMATE')}
                    />
                    Legitimate
                  </label>
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="radio"
                      name="rejectKind"
                      checked={rejectKind === 'FRAUD'}
                      onChange={() => setRejectKind('FRAUD')}
                    />
                    Fraud / Violation
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Primary Reason</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC]"
                >
                  <option value="ROLE_MISMATCH">Role Mismatch</option>
                  <option value="COMPENSATION_MISALIGNMENT">Compensation Misalignment</option>
                  <option value="AVAILABILITY_TIMELINE">Availability Timeline</option>
                  <option value="COMMUNICATION_FIT">Communication / Culture Fit</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>

              <Textarea
                label="Detailed Explanation (min 10 characters)"
                required
                value={rejectDetails}
                onChange={(e) => setRejectDetails(e.target.value)}
                placeholder="Provide specific feedback justifying the rejection decision..."
                className="min-h-[100px]"
              />

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="secondary" type="button" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={rejectMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
                  {rejectMutation.isPending ? 'Submitting...' : 'Submit Rejection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalAlignmentSession;
