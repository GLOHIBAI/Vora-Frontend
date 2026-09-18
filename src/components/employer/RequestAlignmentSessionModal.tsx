import React, { useState } from 'react';
import { CloseIcon, VideoIcon, LocationIcon, CheckIcon } from '../common/Icons';
import DateInput from '../common/DateInput';
import { toISODate } from '../../utils/date';
import { toast } from 'react-hot-toast';
import { useEmployerDecideAlignMutation } from '../../services/queries/assessments';

interface RequestAlignmentSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateCode: string;
  assessmentId?: string;
  onSuccess?: () => void;
}

const RequestAlignmentSessionModal: React.FC<RequestAlignmentSessionModalProps> = ({
  isOpen,
  onClose,
  candidateCode,
  assessmentId,
  onSuccess,
}) => {
  const [sessionType, setSessionType] = useState<'video' | 'in-person' | null>(null);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alignMutation = useEmployerDecideAlignMutation();

  if (!isOpen) return null;

  const handleReset = () => {
    setSessionType(null);
    setProposedDate('');
    setProposedTime('');
    setLocationAddress('');
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionType) return;
    if (!proposedDate) {
      toast.error('Please select a proposed date');
      return;
    }
    if (sessionType === 'video' && !proposedTime) {
      toast.error('Please select a proposed time');
      return;
    }
    if (sessionType === 'in-person' && !locationAddress.trim()) {
      toast.error('Please enter a location address');
      return;
    }
    setIsSubmitting(true);
    try {
      if (assessmentId) {
        const timePart = proposedTime || '10:00';
        const startsAt = new Date(`${proposedDate}T${timePart}:00`).toISOString();
        const slotLabel = sessionType === 'video' ? 'Video Alignment' : (locationAddress.trim() || 'In-person Alignment');
        await alignMutation.mutateAsync({
          assessmentId,
          slots: [{ label: slotLabel, startsAt, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }],
        });
      }
      setIsSuccess(true);
      toast.success('Alignment session requested successfully!');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to request alignment session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] max-w-[560px] w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-7 py-5 sm:py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
            Request Alignment Session
          </h2>
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <CloseIcon size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {!isSuccess ? (
            <form id="alignment-form" onSubmit={handleRequestSubmit} className="space-y-6">
              {/* Subtitle */}
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Schedule a Final Alignment Session with <strong className="font-bold text-gray-900">{candidateCode}</strong>.
              </p>

              {/* Session Type Section */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-gray-900 block">Session type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Video Session Card */}
                  <button
                    type="button"
                    onClick={() => setSessionType('video')}
                    className={`p-5 rounded-[16px] border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      sessionType === 'video'
                        ? 'border-[#0052CC] bg-white shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                        sessionType === 'video' ? 'text-[#0052CC]' : 'text-gray-600'
                      }`}>
                        <VideoIcon size={26} strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-gray-900 leading-snug">Video Session</h4>
                        <p className="text-[12px] text-gray-400 mt-0.5">Hosted on VORA. 45-min max.</p>
                      </div>
                    </div>
                  </button>

                  {/* In-Person Visit Card */}
                  <button
                    type="button"
                    onClick={() => setSessionType('in-person')}
                    className={`p-5 rounded-[16px] border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      sessionType === 'in-person'
                        ? 'border-[#0052CC] bg-white shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                        sessionType === 'in-person' ? 'text-[#0052CC]' : 'text-gray-600'
                      }`}>
                        <LocationIcon size={26} strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-gray-900 leading-snug">In-Person Visit</h4>
                        <p className="text-[12px] text-gray-400 mt-0.5">On-site. Employer covers travel.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* State 1: Nothing selected yet */}
              {!sessionType && (
                <div className="bg-[#EFF6FF] border border-blue-200 rounded-[14px] p-4 text-[13px] text-[#1D4ED8] font-medium animate-in fade-in duration-200">
                  Select a session type above to continue.
                </div>
              )}

              {/* State 2: Video Session Selected */}
              {sessionType === 'video' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <DateInput
                    label="Proposed Date"
                    labelClassName="text-[12.5px] font-semibold text-gray-700 block mb-1.5"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    iconPosition="right"
                    min={toISODate(new Date())}
                    className="!rounded-[12px] !border-gray-200 !py-3 !text-[13px] focus:!border-[#0052CC] focus:!ring-[#0052CC]"
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="text-[12.5px] font-semibold text-gray-700">Proposed Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        required
                        value={proposedTime}
                        onChange={(e) => setProposedTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-[12px] border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                      />
                    </div>
                  </div>

                  <div className="bg-[#EFF6FF] border border-blue-200 rounded-[14px] p-4 text-[12.5px] text-[#1E40AF] leading-relaxed">
                    <strong className="font-bold text-[#1E3A8A]">Session deposit:</strong> A refundable $150 deposit is charged and credited back on confirmed hire.
                  </div>
                </div>
              )}

              {/* State 3: In-Person Visit Selected */}
              {sessionType === 'in-person' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <DateInput
                    label="Proposed Date"
                    labelClassName="text-[12.5px] font-semibold text-gray-700 block mb-1.5"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    iconPosition="right"
                    min={toISODate(new Date())}
                    className="!rounded-[12px] !border-gray-200 !py-3 !text-[13px] focus:!border-[#0052CC] focus:!ring-[#0052CC]"
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="text-[12.5px] font-semibold text-gray-700">Location / Office Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WHO Regional Office"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-[12px] border border-gray-200 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-[14px] p-4 text-[12.5px] text-[#854D0E] leading-relaxed">
                    <strong className="font-bold text-[#713F12]">5 business days</strong> after the visit to confirm hire or submit a documented rejection.
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* State 4: Success confirmation */
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border-2 border-[#22C55E] flex items-center justify-center text-[#16A34A] shadow-xs">
                <CheckIcon size={30} strokeWidth={3} />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-[22px] font-bold text-gray-900 tracking-tight">
                  Session Requested
                </h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">
                  The {sessionType === 'video' ? 'video' : 'in-person'} alignment session has been requested. The candidate will receive an invitation via VORA.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 sm:py-5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
          {!isSuccess ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-6 rounded-full border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="alignment-form"
                disabled={!sessionType || isSubmitting}
                className={`py-2.5 px-7 rounded-full text-[14px] font-bold transition-all ${
                  sessionType
                    ? 'bg-[#0052CC] hover:bg-[#0047CC] text-white shadow-xs cursor-pointer active:scale-[0.99]'
                    : 'bg-gray-100 text-gray-400 border border-gray-200/80 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Requesting...' : 'Request Session'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-8 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full text-[14px] font-bold shadow-xs cursor-pointer transition-all active:scale-[0.99]"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestAlignmentSessionModal;
