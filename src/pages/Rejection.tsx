import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  AlertTriangleIcon,
  CheckIcon,
} from '../components/common/Icons';

import { REJECTION_REASONS, FLAGGED_WORDS } from '../constants/rejection';

const Rejection: React.FC = () => {
  const { id, applicantId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'flagged' | 'confirmed'>('form');
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [details, setDetails] = useState('');
  const [isFlagged, setIsFlagged] = useState(false);

  const reasons = REJECTION_REASONS;

  const handleDetailsChange = (val: string) => {
    setDetails(val);
    const hasFlaggedWords = FLAGGED_WORDS.some(word => val.toLowerCase().includes(word));
    setIsFlagged(hasFlaggedWords && val.length > 10);
  };

  const handleSubmit = () => {
    if (!selectedReason || !details.trim()) return;
    if (isFlagged) {
      setStep('flagged');
    } else {
      setStep('confirmed');
    }
  };

  const isFormValid = selectedReason && details.trim().length > 0 && (selectedReason !== 'other' || otherReason.trim().length > 0);

  return (
    // <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-gray-400 font-medium overflow-x-auto whitespace-nowrap">
        <Link to="/jobs" className="text-[#0047CC] hover:underline">Jobs</Link>
        <ChevronRightIcon size={14} />
        <Link to={`/jobs/${id}`} className="text-[#0047CC] hover:underline truncate max-w-[150px]">Global Health Policy Analyst Intern</Link>
        <ChevronRightIcon size={14} />
        <span className="text-gray-900 font-bold">Rejection</span>
      </nav>

      {/* Candidate Chip */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-lg shrink-0">
          !
        </div>
        <div>
          <div className="text-[14px] font-bold text-gray-900">{applicantId || 'APP-008'}</div>
          <div className="text-[12px] text-gray-500 font-medium">Global Health Policy Analyst Intern – Malaria Program</div>
        </div>
      </div>

      {step === 'form' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 font-['Nunito_Sans']">Document Rejection Reason</h2>
            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
              A rejection reason is required. VORA reviews all rejections against the candidate's verified assessment record. Reasons that reference competency, communication ability, or professional judgment — already assessed and passed — will trigger an automatic review.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-[14px] font-bold text-gray-900">Select primary rejection reason</label>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <label 
                  key={reason.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedReason === reason.id 
                      ? 'border-[#0047CC] bg-[#EBF6FF]' 
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="rejection_reason" 
                    className="accent-[#0047CC] w-4 h-4"
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                  />
                  <span className="text-[14px] font-bold text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'other' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[14px] font-bold text-gray-900">Specify reason</label>
                <input 
                  type="text"
                  placeholder="Describe the rejection reason"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[14px] font-bold text-gray-900">
              Additional details <span className="font-normal text-gray-400 ml-1">(required)</span>
            </label>
            <textarea 
              rows={5}
              placeholder="Provide specific, documented details to support this rejection. This is reviewed by VORA and held in the audit trail."
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium resize-none"
              value={details}
              onChange={(e) => handleDetailsChange(e.target.value)}
            />
            {isFlagged && (
              <div className="flex items-center gap-2 text-[#DC2626] text-[12px] font-bold animate-in fade-in slide-in-from-top-1">
                <AlertTriangleIcon size={14} />
                Your details appear to reference competency or assessment-related criteria already verified by VORA. This will trigger a review.
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
              All rejection data is logged with a timestamp in the audit trail. If a Final Alignment Session occurred, the session recording will be reviewed alongside this submission.
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={!isFormValid}
              onClick={handleSubmit}
              className={`px-8 py-3 rounded-full text-[14px] font-bold transition-all ${
                isFormValid 
                  ? 'bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-lg shadow-red-500/20' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Rejection
            </button>
          </div>
        </div>
      )}

      {step === 'flagged' && (
        <div className="bg-white border-2 border-[#DC2626] rounded-2xl p-8 shadow-xl space-y-8 animate-in zoom-in duration-300">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border-2 border-[#FECACA] flex items-center justify-center">
            <AlertTriangleIcon size={24} className="text-[#DC2626]" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 font-['Nunito_Sans']">Rejection Flagged for Review</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
              Your rejection documentation references criteria that overlap with competencies already verified through VORA's three-stage assessment. This has been automatically flagged for review by the VORA compliance team.
            </p>
          </div>

          <div className="bg-[#FEF2F2] rounded-xl p-6 space-y-4">
            <h4 className="text-[12px] font-black text-[#DC2626] uppercase tracking-wider">What this means</h4>
            <ul className="space-y-3">
              {[
                'The escrow will not be released until the review concludes',
                'The session recording (if applicable) will be examined',
                'The VORA compliance team will contact you within 48 hours',
                'If the rejection is found to be without documented cause, the session deposit is forfeited'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[13px] font-bold text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button 
              onClick={() => setStep('form')}
              className="px-6 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Edit Submission
            </button>
            <button 
              onClick={() => setStep('confirmed')}
              className="px-8 py-3 bg-[#DC2626] text-white rounded-full text-[14px] font-bold hover:bg-[#B91C1C] transition-all shadow-lg shadow-red-500/20"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm text-center space-y-8 animate-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center mx-auto">
            <CheckIcon size={32} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 font-['Nunito_Sans']">Rejection Submitted</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium max-w-sm mx-auto">
              {applicantId || 'APP-008'} has been moved to your Rejected pipeline. The candidate has been notified and the rejection documentation has been logged in your audit trail.
            </p>
          </div>
          <button 
            onClick={() => navigate('/talents')}
            className="px-10 py-4 bg-[#0047CC] text-white rounded-full text-[15px] font-bold hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/20"
          >
            Return to Talents
          </button>
        </div>
      )}
    </div>
  );
};

export default Rejection;
