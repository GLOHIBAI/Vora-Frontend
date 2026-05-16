import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  VideoIcon, 
  LocationIcon, 
  CheckIcon,
  AlertTriangleIcon
} from '../../components/common/Icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { SAMPLE_JOB_DETAILS } from '../../constants/mockData';

type Step = 'choose' | 'video-setup' | 'inperson-setup' | 'confirm';
type SessionType = 'video' | 'inperson';

const FinalAlignmentSession: React.FC = () => {
  const { id, candidateId } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('choose');
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  
  // Mock job and candidate data
  const job = SAMPLE_JOB_DETAILS;
  const candidate = {
    code: candidateId || 'APP-008',
    score: '92%',
    location: 'Addis Ababa, Ethiopia'
  };

  const handleBack = () => {
    if (step === 'choose') {
      navigate(`/jobs/${id}`);
    } else {
      setStep('choose');
    }
  };

  const handleConfirm = () => {
    setStep('confirm');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 text-[14px]">
        <Link to="/jobs" className="text-gray-400 hover:text-[#0047CC] transition-colors font-medium">Jobs</Link>
        <ChevronRightIcon size={14} className="text-gray-300" />
        <Link to={`/jobs/${id}`} className="text-gray-400 hover:text-[#0047CC] transition-colors font-medium">{job.title}</Link>
        <ChevronRightIcon size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium">Final Alignment Session</span>
      </div>

      {/* Candidate Chip */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#EBF6FF] border border-[#387DFF] rounded-2xl p-5">
        <div className="w-10 h-10 rounded-full bg-[#0047CC] text-white flex items-center justify-center font-medium text-[14px] shrink-0">
          1
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-[14px] font-medium text-[#0047CC]">{candidate.code}</p>
          <p className="text-[12px] font-medium text-gray-500">Overall score: {candidate.score} · Top-ranked candidate</p>
        </div>
        <span className="px-4 py-1 bg-[#EEFBEE] text-[#135813] border border-transparent rounded-full text-[11px] font-medium uppercase tracking-tight">
          Provisional hire intent logged
        </span>
      </div>

      {step === 'choose' && (
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
          <h2 className="text-[20px] font-medium text-gray-900 mb-2 ">Request a Final Alignment Session</h2>
          <p className="text-[14px] font-medium text-gray-400 mb-8 leading-relaxed max-w-2xl">
            This is a structured session to confirm logistics, cultural alignment, and onboarding readiness — not a reassessment of competency already verified. Select your preferred format.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setSessionType('video')}
              className={`p-6 rounded-2xl border-2 text-left transition-all group ${sessionType === 'video' ? 'bg-blue-50 border-[#0047CC]' : 'bg-white border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`p-3 rounded-xl mb-4 inline-block ${sessionType === 'video' ? 'bg-[#0047CC] text-white' : 'bg-gray-50 text-gray-400'}`}>
                <VideoIcon size={24} />
              </div>
              <p className="text-[16px] font-medium text-gray-900 mb-2">Video Session</p>
              <p className="text-[13px] font-medium text-gray-400 leading-relaxed">
                Conducted within the VORA platform. Recorded, structured, 45-minute maximum.
              </p>
            </button>

            <button 
              onClick={() => setSessionType('inperson')}
              className={`p-6 rounded-2xl border-2 text-left transition-all group ${sessionType === 'inperson' ? 'bg-blue-50 border-[#0047CC]' : 'bg-white border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`p-3 rounded-xl mb-4 inline-block ${sessionType === 'inperson' ? 'bg-[#0047CC] text-white' : 'bg-gray-50 text-gray-400'}`}>
                <LocationIcon size={24} />
              </div>
              <p className="text-[16px] font-medium text-gray-900 mb-2">In-Person Visit</p>
              <p className="text-[13px] font-medium text-gray-400 leading-relaxed">
                On-site session. Employer covers all candidate travel and accommodation through the platform.
              </p>
            </button>
          </div>

          {sessionType === 'inperson' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-4 mb-8">
              <AlertTriangleIcon size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-blue-900 mb-1">Note on travel costs:</p>
                <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                  As this candidate is based in {candidate.location}, you will be required to fund travel and accommodation. Funds will be loaded through the VORA platform before the session is confirmed. <span className="font-medium">Same-city visits require no transport coverage.</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={() => setStep(sessionType === 'video' ? 'video-setup' : 'inperson-setup')}
              disabled={!sessionType}
              className="px-10"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {(step === 'video-setup' || step === 'inperson-setup') && (
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <button onClick={handleBack} className="flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-[#0047CC] transition-colors mb-6 cursor-pointer group">
              <ChevronLeftIcon size={16} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
            <h2 className="text-[20px] font-medium text-gray-900 mb-2 ">
              {step === 'video-setup' ? 'Video Session Details' : 'In-Person Visit Details'}
            </h2>
            <p className="text-[14px] font-medium text-gray-400 leading-relaxed">
              {step === 'video-setup' 
                ? 'The session will be hosted within VORA. Both parties consent to recording as per platform terms. Maximum duration: 45 minutes.'
                : 'You must fund candidate travel and accommodation through the VORA platform before this request is confirmed. The candidate books directly through our travel integration.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label={step === 'video-setup' ? 'Proposed Date' : 'Visit Date'} type="date" placeholder="Select date" />
            {step === 'video-setup' ? (
              <Input label="Proposed Time" type="time" placeholder="Select time" />
            ) : (
              <Input label="Travel Budget (USD)" type="number" placeholder="Estimated travel + accommodation" />
            )}
            
            {step === 'inperson-setup' && (
              <div className="sm:col-span-2">
                <Input label="Location / Office Address" placeholder="e.g. WHO Regional Office, Brazzaville, Congo" />
              </div>
            )}
            
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-3">Session Focus Notes (optional)</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-[14px] font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] focus:ring-1 focus:ring-[#0047CC] transition-all min-h-[120px]"
                placeholder={step === 'video-setup' ? "e.g. Confirm start date, discuss onboarding preferences, team introduction…" : "Topics to confirm during the in-person visit…"}
              />
            </div>
          </div>

          {step === 'video-setup' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-4 mb-8">
              <AlertTriangleIcon size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-blue-900 mb-1">Note on travel costs:</p>
                <p className="text-[12px] font-medium text-gray-500 leading-relaxed">
                  In-person alignment sessions require the employer to cover standard transport and/or lodging.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                The employer has <span className="font-medium">5 business days</span> after the visit to confirm hire or submit a documented rejection. If no decision is received, VORA will intervene and the candidate will be notified.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={handleBack} className="px-8 py-3 bg-white border border-gray-100 rounded-full text-[14px] font-medium text-gray-500 hover:bg-gray-50 transition-all cursor-pointer">
              Cancel
            </button>
            <Button onClick={handleConfirm} className="px-8">
              {step === 'video-setup' ? 'Confirm & Send Invite' : 'Confirm & Load Funds'}
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="bg-white border border-gray-100 rounded-[32px] p-12 shadow-sm text-center max-w-xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckIcon size={32} className="text-green-600" strokeWidth={3} />
          </div>
          <h2 className="text-[24px] font-medium text-gray-900 mb-4 ">Session Request Confirmed</h2>
          <p className="text-[15px] font-medium text-gray-400 mb-10 leading-relaxed">
            Your Final Alignment Session request has been sent to {candidate.code}. They have been informed that you have declared provisional hire intent. A decision is required within 48 hours of the session concluding.
          </p>

          <div className="bg-blue-50/50 border border-blue-100 rounded-[24px] p-8 text-left space-y-4 mb-10">
            <p className="text-[13px] font-medium text-[#0047CC] uppercase tracking-widest">What happens next</p>
            <ul className="space-y-4">
              {[
                'Candidate accepts or proposes an alternative time',
                'Session brief is generated for both parties',
                'Session is hosted within VORA (recorded per platform terms)',
                'You have 48 hours post-session to click Hire or submit a documented rejection'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-[14px] font-medium text-gray-600">
                  <span className="w-6 h-6 rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={() => navigate(`/jobs/${id}`)} className="w-full sm:w-auto px-12">
            Back to Applicants
          </Button>
        </div>
      )}
    </div>
  );
};

export default FinalAlignmentSession;
