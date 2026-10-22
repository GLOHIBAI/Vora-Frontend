import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRightIcon, ChevronLeftIcon } from '../../components/common/Icons';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import { toast } from 'react-hot-toast';
import { useSubmitCheckInMutation } from '../../services/queries/postHire';

const SubmitCheckInPage: React.FC = () => {
  const { checkInId } = useParams<{ checkInId: string }>();
  const navigate = useNavigate();
  const submitCheckInMutation = useSubmitCheckInMutation();

  const [overallRating, setOverallRating] = useState<number>(4);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [flagMentor, setFlagMentor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInId) {
      toast.error('Check-in ID missing');
      return;
    }

    try {
      await submitCheckInMutation.mutateAsync({
        checkInId,
        body: {
          overallRating,
          additionalNotes: additionalNotes.trim() || undefined,
          mentorConnectionFlagged: flagMentor,
        },
      });
      toast.success('Check-in submitted successfully');
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit check-in');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2.5 text-[13px]">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-[#0047CC] flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <ChevronLeftIcon size={14} /> Back
        </button>
        <ChevronRightIcon size={12} className="text-gray-300" />
        <span className="text-gray-900 font-medium">Performance Check-In</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-xs">
        <h1 className="text-[20px] font-bold text-gray-900 mb-2">Complete Post-Hire Check-In</h1>
        <p className="text-[13px] text-gray-400 mb-8 leading-relaxed">
          Record performance observations, rating, and milestones for this review cycle. Submitting on time maintains full pipeline access.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              Overall Performance Rating
            </label>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setOverallRating(num)}
                  className={`py-3 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
                    overallRating === num
                      ? 'bg-[#0047CC] text-white shadow-xs'
                      : 'bg-slate-50 text-gray-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {num} {num === 5 ? '★' : ''}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              1 = Needs urgent intervention · 3 = Meeting role expectations · 5 = Exceeding all targets
            </p>
          </div>

          <Textarea
            label="Detailed Feedback & Check-In Notes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Document key milestones achieved, delivery quality, areas for skill development..."
            className="min-h-[120px]"
          />

          <label className="flex items-start gap-3.5 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-[13px] cursor-pointer">
            <input
              type="checkbox"
              checked={flagMentor}
              onChange={(e) => setFlagMentor(e.target.checked)}
              className="mt-0.5 rounded text-[#0047CC]"
            />
            <span className="text-blue-900 leading-relaxed">
              <strong>Flag for Mentor Connection:</strong> Request that VORA connects this candidate with a mentor for supplementary technical or domain reinforcement.
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitCheckInMutation.isPending}>
              {submitCheckInMutation.isPending ? 'Submitting...' : 'Submit Check-In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitCheckInPage;
