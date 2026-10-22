import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, CloseIcon, CheckIcon } from '../common/Icons';
import Button from '../common/Button';
import Tag from '../common/Tag';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import { toast } from 'react-hot-toast';
import {
  usePostHireHiresQuery,
  useSubmitCheckInMutation,
  type PostHireItem,
} from '../../services/queries/postHire';

const PostHireTrackingView: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = usePostHireHiresQuery();
  const submitCheckInMutation = useSubmitCheckInMutation();

  // Check-in modal state
  const [activeCheckInModal, setActiveCheckInModal] = useState<{
    checkInId: string;
    talentName: string;
  } | null>(null);

  const [overallRating, setOverallRating] = useState<number>(4);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [flagMentor, setFlagMentor] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="w-8 h-8 border-4 border-[#0047CC] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-gray-500 font-medium">Loading post-hire tracking data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center shadow-xs">
        <p className="text-[14px] text-red-600 mb-3 font-medium">Failed to load post-hire hires.</p>
        <Button size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const metrics = data?.metrics || {
    activeHiresTracked: 0,
    checkInsOverdue: 0,
    benchmarksPending: 0,
    onTrack: 0,
  };

  const bannerAlert = data?.bannerAlert;
  const items = data?.items || [];

  const handleOpenCheckIn = (checkInId: string, talentName: string) => {
    setActiveCheckInModal({ checkInId, talentName });
    setOverallRating(4);
    setAdditionalNotes('');
    setFlagMentor(false);
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckInModal?.checkInId) return;

    try {
      await submitCheckInMutation.mutateAsync({
        checkInId: activeCheckInModal.checkInId,
        body: {
          overallRating,
          additionalNotes: additionalNotes.trim() || undefined,
          mentorConnectionFlagged: flagMentor,
        },
      });
      toast.success('Check-in submitted successfully!');
      setActiveCheckInModal(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit check-in');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Urgent Overdue Banner */}
      {bannerAlert?.hasUrgentAlert && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[14px] p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="p-2 bg-white rounded-full border border-[#FDE68A]">
            <AlertTriangleIcon size={18} className="text-[#92400E]" />
          </div>
          <p className="text-[13px] font-medium text-[#78350F] flex-1">
            {bannerAlert.message || (
              <>
                <strong>{bannerAlert.talentName ? `${bannerAlert.talentName}'s check-in is overdue.` : 'Overdue check-in action needed.'}</strong> Please complete the check-in to keep pipeline access active.
              </>
            )}
          </p>
          {bannerAlert.checkInId && (
            <Button 
              variant="primary"
              fullWidth={false}
              className="px-6 py-2 !bg-[#0047CC] hover:!bg-blue-700 !text-white text-[12px] font-semibold !border-none whitespace-nowrap min-h-0 transition-all duration-200 shadow-xs"
              onClick={() => handleOpenCheckIn(bannerAlert.checkInId!, bannerAlert.talentName || 'Candidate')}
            >
              {bannerAlert.ctaText || 'Complete Now'}
            </Button>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ACTIVE HIRES TRACKED', value: String(metrics.activeHiresTracked), sub: 'Active employees' },
          { label: 'CHECK-INS OVERDUE', value: String(metrics.checkInsOverdue), sub: metrics.checkInsOverdue > 0 ? 'Action needed' : 'All up to date' },
          { label: 'BENCHMARKS PENDING', value: String(metrics.benchmarksPending), sub: 'Goal configuration' },
          { label: 'ON TRACK', value: String(metrics.onTrack), sub: 'Meeting expectations' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-xs">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
            <p className="text-[28px] font-bold text-gray-900 leading-none mb-2">{stat.value}</p>
            <p className="text-[11px] font-medium text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Talent Tracking Table */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-xs overflow-hidden">
        <div className="bg-[#F9FAFB] px-8 py-4 flex items-center text-[11px] font-medium text-gray-400 uppercase tracking-widest">
          <div className="flex-[2.5]">Name / Role</div>
          <div className="flex-1">Hired</div>
          <div className="flex-1">Score</div>
          <div className="flex-[1.5]">Next Action</div>
          <div className="flex-[2]">Tracking Status</div>
          <div className="w-28 text-right">Action</div>
        </div>

        {items.length === 0 ? (
          <div className="px-8 py-12 text-center text-gray-400 text-[13px]">
            No hired talent currently being tracked.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((talent: PostHireItem) => {
              const initials = talent.talentInitials || talent.talentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
              const isOverdue = talent.nextCheckIn?.overdue;

              return (
                <div key={talent.hireId} className="px-8 py-5 flex items-center hover:bg-gray-50/50 transition-colors group">
                  <div className="flex-[2.5] flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#0047CC] text-white flex items-center justify-center font-bold text-[12px] shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 truncate">{talent.talentName}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5 truncate">{talent.role}</p>
                    </div>
                  </div>

                  <div className="flex-1 text-[13px] font-medium text-gray-500">
                    {talent.hiredOn ? new Date(talent.hiredOn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>

                  <div className="flex-1 text-[14px] font-semibold text-gray-800">
                    {talent.assessmentScore ? `${talent.assessmentScore}%` : '—'}
                  </div>

                  <div className="flex-[1.5]">
                    <p className={`text-[12px] font-semibold ${isOverdue ? 'text-red-700' : 'text-gray-700'}`}>
                      {talent.nextCheckIn?.label || 'None scheduled'}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                      {talent.nextCheckIn?.dueLabel || ''}
                    </p>
                  </div>

                  <div className="flex-[2]">
                    <Tag 
                      label={talent.trackingStatusLabel || talent.trackingStatus}
                      variant={
                        talent.trackingStatus === 'CHECK_IN_DUE' ? 'red' :
                        talent.trackingStatus === 'ON_TRACK' ? 'green' :
                        talent.trackingStatus === 'BENCHMARKS_PENDING' ? 'yellow' : 'gray'
                      }
                    />
                  </div>

                  <div className="w-28 flex justify-end">
                    {talent.action?.checkInId ? (
                      <Button 
                        variant="primary"
                        size="sm"
                        fullWidth={false}
                        className="px-3 py-1.5 min-h-0 text-[11px]"
                        onClick={() => handleOpenCheckIn(talent.action.checkInId!, talent.talentName)}
                      >
                        {talent.action.label || 'Check-in'}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        size="sm"
                        fullWidth={false}
                        className="px-3 py-1.5 min-h-0 text-[11px]"
                        onClick={() => {
                          if (talent.rolePostingId) {
                            navigate(`/jobs/${talent.rolePostingId}`);
                          }
                        }}
                      >
                        View Job
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-In Submission Modal */}
      {activeCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-gray-900">
                Submit Performance Check-In
              </h3>
              <button
                onClick={() => setActiveCheckInModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <p className="text-[13px] text-gray-500 mb-5">
              Completing check-in for <strong className="text-gray-800">{activeCheckInModal.talentName}</strong>.
            </p>

            <form onSubmit={handleSubmitCheckIn} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Overall Performance Rating (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setOverallRating(num)}
                      className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all ${
                        overallRating === num
                          ? 'bg-[#0047CC] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {num} {num === 5 ? '★' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                label="Check-in Observations & Feedback"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Share key accomplishments, challenges, or support needed..."
                className="min-h-[100px]"
              />

              <label className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagMentor}
                  onChange={(e) => setFlagMentor(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-blue-900">
                  <strong>Request Mentor Support:</strong> Flag this talent for additional mentor guidance or skill reinforcement.
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setActiveCheckInModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitCheckInMutation.isPending}
                >
                  {submitCheckInMutation.isPending ? 'Submitting...' : 'Submit Check-In'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostHireTrackingView;
