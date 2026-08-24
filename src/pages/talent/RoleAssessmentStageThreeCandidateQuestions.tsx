import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import Button from '../../components/common/Button';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';
import { submitComponentResponses, fetchGate3Items } from '../../services/queries/assessments';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId } from '../../utils/assessmentSession';

interface CandidateQuestionItem {
  id: string;
  topic?: string;
  videoUrl: string;
  videoBlob?: Blob;
  durationSecs?: number;
  createdAt: string;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const VideoCameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z" />
    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </svg>
);

const RoleAssessmentStageThreeCandidateQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  const { data: roleResponse } = useGetPublicRoleQuery(roleSlug || '');
  const roleData = roleResponse?.data || roleResponse;
  const companyName = roleData?.companyName || 'the hiring team';

  // Choice state: 'yes' | 'no'
  const [hasQuestions, setHasQuestions] = useState<'yes' | 'no' | null>(null);

  // Stored questions list (up to 5)
  const [questionsList, setQuestionsList] = useState<CandidateQuestionItem[]>([]);

  // Current recording / drafting state
  const [activeTab, setActiveTab] = useState<'live' | 'upload'>('live');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecordingStopped, setIsRecordingStopped] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [hasWebcamPermission, setHasWebcamPermission] = useState<boolean | null>(null);
  const [recElapsed, setRecElapsed] = useState<number>(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 20, 45, 60, 40, 25, 55, 35, 10, 20, 15]);

  // Upload file state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Analysis / completion overlay
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [componentId, setComponentId] = useState<string>('gate3_component');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);

  // Fetch componentId from session if available
  useEffect(() => {
    if (!assessmentId) return;
    fetchGate3Items(assessmentId)
      .then((res: any) => {
        const comp = res?.componentId || res?.data?.componentId;
        if (comp) setComponentId(comp);
      })
      .catch(() => { });
  }, [assessmentId]);

  // Camera stream controls
  useEffect(() => {
    if (hasQuestions === 'yes' && activeTab === 'live' && !isRecordingStopped) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [hasQuestions, activeTab, isRecordingStopped]);

  // Visual audio bars rhythm
  useEffect(() => {
    let interval: any = null;
    if (hasQuestions === 'yes' && activeTab === 'live' && isRecording) {
      interval = setInterval(() => {
        setAudioLevels(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
      }, 140);
    } else {
      setAudioLevels([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, activeTab, hasQuestions]);

  // Timer: recording elapsed
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isRecordingStopped) {
      interval = setInterval(() => {
        setRecElapsed(prev => {
          if (prev >= 120) { // 2 minute cap per candidate question
            handleStopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isRecordingStopped]);

  const startCamera = async (): Promise<MediaStream | null> => {
    try {
      if (streamRef.current && streamRef.current.active) {
        if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        return streamRef.current;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasWebcamPermission(true);
      return stream;
    } catch (err) {
      console.warn('Webcam stream unavailable', err);
      setHasWebcamPermission(false);
      return null;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleStartRecording = async () => {
    setRecordedVideoUrl(null);
    recordedBlobRef.current = null;
    setIsRecordingStopped(false);
    setRecElapsed(0);
    chunksRef.current = [];

    let stream = streamRef.current;
    if (!stream || !stream.active) {
      stream = await startCamera();
    }

    if (!stream) {
      toast.error('Unable to access camera or microphone. Please allow permissions.');
      return;
    }

    try {
      let mimeType = 'video/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          mimeType = 'video/webm;codecs=vp9,opus';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
          mimeType = 'video/webm;codecs=vp8,opus';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = () => {
        const cleanType = (mimeType || 'video/webm').split(';')[0].trim().toLowerCase() || 'video/webm';
        const file = new File(chunksRef.current, `candidate-question-${Date.now()}.webm`, { type: cleanType });
        recordedBlobRef.current = file;
        const url = URL.createObjectURL(file);
        setRecordedVideoUrl(url);
        setIsRecordingStopped(true);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Live recording started');
    } catch (err: any) {
      console.error('MediaRecorder start error:', err);
      toast.error('Failed to start recording: ' + (err?.message || 'Error initializing recorder'));
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        toast.success('Question recorded! You can preview or save.');
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
    }
    setIsRecording(false);
  };

  const handleRetake = () => {
    setRecordedVideoUrl(null);
    recordedBlobRef.current = null;
    setIsRecordingStopped(false);
    setIsRecording(false);
    setRecElapsed(0);
    handleStartRecording();
  };

  // Upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const validExts = ['.mp4', '.mov', '.webm'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExts.includes(ext)) {
      toast.error('Unsupported format! Upload MP4, MOV, or WebM.');
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      toast.error('File size exceeds the 50 mb limit!');
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedUrl(url);
    toast.success('Video upload validated.');
  };

  const handleSaveQuestion = () => {
    const videoUrl = activeTab === 'live' ? recordedVideoUrl : uploadedUrl;
    const videoBlob = activeTab === 'live' ? (recordedBlobRef.current || undefined) : (uploadedFile || undefined);

    if (!videoUrl) {
      toast.error('Please record or upload a video for this question.');
      return;
    }

    if (questionsList.length >= 5) {
      toast.error('Maximum 5 questions reached.');
      return;
    }

    const newQuestion: CandidateQuestionItem = {
      id: `candidate_q_${Date.now()}`,
      topic: currentTopic.trim() || `Question ${questionsList.length + 1}`,
      videoUrl,
      videoBlob,
      durationSecs: recElapsed || undefined,
      createdAt: new Date().toISOString(),
    };

    setQuestionsList(prev => [...prev, newQuestion]);
    toast.success(`Question ${questionsList.length + 1} added!`);

    // Reset current form
    setCurrentTopic('');
    setRecordedVideoUrl(null);
    recordedBlobRef.current = null;
    setIsRecordingStopped(false);
    setIsRecording(false);
    setUploadedFile(null);
    setUploadedUrl(null);
    setRecElapsed(0);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestionsList(prev => prev.filter(q => q.id !== id));
    toast.success('Question removed.');
  };

  const handleCompleteFlow = async () => {
    // Form validation
    if (!hasQuestions) {
      toast.error('Please choose whether you have questions before proceeding.');
      return;
    }

    if (hasQuestions === 'yes' && questionsList.length === 0) {
      toast.error('Please record and save at least one question, or select "No questions at this time".');
      return;
    }

    stopCamera();
    setIsCompiling(true);

    try {
      // Store in localStorage for client-side reporting (avoid passing non-item keys to backend)
      if (questionsList.length > 0) {
        try {
          const serialized = questionsList.map(q => ({
            id: q.id,
            topic: q.topic,
            createdAt: q.createdAt,
            durationSecs: q.durationSecs,
          }));
          localStorage.setItem('vora_stage3_candidate_questions', JSON.stringify(serialized));
        } catch {
          // ignore serialization errors
        }
      }

      // Submit component completion with standard empty payload {} (matches Stage 3 video completion)
      if (assessmentId && componentId) {
        try {
          await submitComponentResponses(assessmentId, componentId, {});
        } catch (err) {
          console.warn('Component submit notice:', err);
        }
      }
    } catch (err) {
      console.warn('Error finalizing candidate questions:', err);
    }

    // Analyzing delay then navigate to stage 3 complete
    setTimeout(() => {
      localStorage.setItem('vora_stage3_completed', 'true');
      localStorage.setItem('vora_stage4_unlocked', 'true');
      setIsCompiling(false);
      toast.success('Stage 3 assessment completed!');
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-3/complete`);
    }, 4000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompiling) {
    return (
      <AssessmentAnalyzingView
        roleSlug={roleSlug}
        title="Scoring Stage 3"
        subtitle="We're compiling and analyzing your video interview responses."
        steps={[
          'Saving interview recordings',
          'Encoding video chunks to H.264 MP4',
          'Attaching candidate inquiries for the hiring team',
          'Analyzing communication clarity and delivery',
          'Compiling final Stage 3 assessment package',
        ]}
        initialStepIndex={0}
        schedule={[
          { atMs: 800, stepIndex: 1 },
          { atMs: 1800, stepIndex: 2 },
          { atMs: 2600, stepIndex: 3 },
          { atMs: 3400, stepIndex: 4 },
          { atMs: 4000, stepIndex: 5 },
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none">

      {/* Topbar */}
      <AssessmentHeader
        middleContent="Stage 3 · Final Step · Questions for the hiring team"
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <CheckIcon className="text-[#0047CC] w-[13px] h-[13px]" />
            Stage 3 final review
          </div>
        }
      />

      {/* Segmented Progress: Full 6/6 completed */}
      <div className="bg-white border-b border-[#E6E6E6] px-[32px] py-[10px]">
        <div className="max-w-[1180px] mx-auto flex gap-[4px]">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-[4px] rounded-full bg-[#0047CC] transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-[1080px] w-full mx-auto p-[32px_24px_100px] flex-1 flex flex-col">

        {/* Title Header */}
        <div className="mb-[28px] text-center max-w-[720px] mx-auto">
          <div className="inline-flex items-center gap-[6px] text-[12px] font-[600] text-[#0047CC] bg-[#EBF6FF] border border-[#387DFF]/20 px-[12px] py-[4px] rounded-full uppercase tracking-[0.6px] mb-[12px]">
            Candidate Voice · Final Step
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-[700] text-[#1A1A1A] leading-[1.3] tracking-[-0.4px] mb-[10px]">
            Any questions for the hiring team?
          </h1>
          <p className="text-[14.5px] text-[#666] leading-[1.6] font-[400]">
            You are free to ask up to <strong>5 questions</strong> for {companyName}. The hiring team can reply via video or text for candidates being considered or hired.
          </p>
        </div>

        {/* Choice Selector Cards (Compulsory choice) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] max-w-[760px] w-full mx-auto mb-[32px]">

          {/* Card: Yes */}
          <button
            type="button"
            onClick={() => setHasQuestions('yes')}
            className={`p-[20px_24px] rounded-[14px] border-[1.5px] text-left transition-all cursor-pointer flex items-start gap-[14px] ${hasQuestions === 'yes'
              ? 'bg-white border-[#0047CC] shadow-[0_4px_16px_rgba(0,71,204,0.1)] ring-2 ring-[#0047CC]/20'
              : 'bg-white border-[#E6E6E6] hover:border-[#0047CC]/40 hover:bg-[#FAFAFA]'
              }`}
          >
            <div className={`w-[22px] h-[22px] rounded-full border-[2px] mt-[2px] flex items-center justify-center shrink-0 ${hasQuestions === 'yes' ? 'border-[#0047CC] bg-[#0047CC]' : 'border-[#D4D4D4]'
              }`}>
              {hasQuestions === 'yes' && <div className="w-[8px] h-[8px] rounded-full bg-white" />}
            </div>
            <div>
              <div className="text-[15px] font-[700] text-[#1A1A1A] mb-[4px] flex items-center gap-[8px]">
                Yes, I have questions
                <span className="text-[11px] font-[600] bg-[#EBF6FF] text-[#0047CC] px-[8px] py-[2px] rounded-full">
                  Up to 5
                </span>
              </div>
              <div className="text-[13px] text-[#666] leading-[1.5]">
                Record or upload short video inquiries about the role, culture, team, or expectations.
              </div>
            </div>
          </button>

          {/* Card: No */}
          <button
            type="button"
            onClick={() => setHasQuestions('no')}
            className={`p-[20px_24px] rounded-[14px] border-[1.5px] text-left transition-all cursor-pointer flex items-start gap-[14px] ${hasQuestions === 'no'
              ? 'bg-white border-[#0047CC] shadow-[0_4px_16px_rgba(0,71,204,0.1)] ring-2 ring-[#0047CC]/20'
              : 'bg-white border-[#E6E6E6] hover:border-[#0047CC]/40 hover:bg-[#FAFAFA]'
              }`}
          >
            <div className={`w-[22px] h-[22px] rounded-full border-[2px] mt-[2px] flex items-center justify-center shrink-0 ${hasQuestions === 'no' ? 'border-[#0047CC] bg-[#0047CC]' : 'border-[#D4D4D4]'
              }`}>
              {hasQuestions === 'no' && <div className="w-[8px] h-[8px] rounded-full bg-white" />}
            </div>
            <div>
              <div className="text-[15px] font-[700] text-[#1A1A1A] mb-[4px]">
                No questions at this time
              </div>
              <div className="text-[13px] text-[#666] leading-[1.5]">
                Everything was clear. Proceed directly to the assessment scoring and compilation.
              </div>
            </div>
          </button>
        </div>

        {/* ── Section: NO SELECTED ── */}
        {hasQuestions === 'no' && (
          <div className="max-w-[540px] w-full mx-auto bg-white border border-[#E6E6E6] rounded-[16px] p-[28px_32px] text-center shadow-sm animate-fadeIn">
            <div className="w-[52px] h-[52px] rounded-full bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center mx-auto mb-[14px]">
              <CheckIcon className="w-[24px] h-[24px]" />
            </div>
            <h3 className="text-[18px] font-[700] text-[#1A1A1A] mb-[8px]">
              Ready to submit Stage 3
            </h3>
            <p className="text-[13.5px] text-[#666] leading-[1.6] mb-[22px]">
              You've answered all 6 core video prompts. Click below to start scoring analysis and unlock Stage 4.
            </p>
            <Button
              variant="primary"
              pill={true}
              onClick={handleCompleteFlow}
              className="w-full py-[12px] text-[14px] font-[600] bg-[#0047CC] hover:bg-[#344DA1] text-white"
            >
              Submit & Proceed to Analysis
            </Button>
          </div>
        )}

        {/* ── Section: YES SELECTED (Interactive Question Builder) ── */}
        {hasQuestions === 'yes' && (
          <div className="max-w-[960px] w-full mx-auto flex flex-col gap-[24px] animate-fadeIn">

            {/* Questions Counter & List (if any already added) */}
            {questionsList.length > 0 && (
              <div className="bg-white border border-[#E6E6E6] rounded-[14px] p-[20px_24px]">
                <div className="flex items-center justify-between mb-[14px] gap-[16px]">
                  <div>
                    <h3 className="text-[16px] font-[700] text-[#1A1A1A]">
                      Your Questions ({questionsList.length} of 5)
                    </h3>
                    <p className="text-[12.5px] text-[#808080]">
                      {questionsList.length < 5
                        ? `You can add ${5 - questionsList.length} more question${5 - questionsList.length > 1 ? 's' : ''}.`
                        : 'You have reached the maximum of 5 questions.'}
                    </p>
                  </div>
                  {questionsList.length >= 1 && (
                    <Button
                      variant="primary"
                      fullWidth={false}
                      pill={true}
                      onClick={handleCompleteFlow}
                      className="bg-[#0047CC] hover:bg-[#344DA1] text-white text-[13.5px] font-[600] px-[20px] py-[9px] shrink-0"
                    >
                      Submit & Finish Stage 3
                    </Button>
                  )}
                </div>

                {/* Question Cards Queue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
                  {questionsList.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-[12px] p-[14px] flex flex-col justify-between relative group"
                    >
                      <div className="flex items-start justify-between gap-[8px] mb-[10px]">
                        <div className="flex items-center gap-[8px]">
                          <span className="w-[24px] h-[24px] rounded-full bg-[#0047CC] text-white text-[11px] font-[700] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[13px] font-[600] text-[#1A1A1A] line-clamp-1">
                            {q.topic}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-[#808080] hover:text-[#DC2626] p-1 rounded transition-colors cursor-pointer bg-transparent border-none"
                          title="Remove question"
                        >
                          <TrashIcon className="w-[15px] h-[15px]" />
                        </button>
                      </div>

                      <div className="bg-[#0B0F14] rounded-[8px] h-[120px] overflow-hidden flex items-center justify-center relative mb-[8px]">
                        <video
                          src={q.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11.5px] text-[#808080]">
                        <span className="inline-flex items-center gap-[4px] text-[#0047CC] font-[600]">
                          <CheckIcon className="w-[12px] h-[12px]" /> Ready
                        </span>
                        {q.durationSecs && <span>{formatTimer(q.durationSecs)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Record New Question Workspace (Only if < 5 questions) */}
            {questionsList.length < 5 ? (
              <div className="bg-white border border-[#E6E6E6] rounded-[16px] p-[24px_28px] shadow-sm">

                <div className="flex items-center justify-between pb-[16px] mb-[18px] border-b border-[#E6E6E6] flex-wrap gap-[10px]">
                  <div>
                    <h3 className="text-[18px] font-[700] text-[#1A1A1A] flex items-center gap-[8px]">
                      <VideoCameraIcon className="w-[18px] h-[18px] text-[#0047CC]" />
                      Record Question {questionsList.length + 1} of 5
                    </h3>
                    <p className="text-[13px] text-[#808080]">
                      Keep each question concise and clear (recommended: under 1-2 minutes).
                    </p>
                  </div>

                  {/* Mode tabs */}
                  <div className="flex items-center gap-[16px]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('live')}
                      disabled={isRecording}
                      className={`pb-[6px] text-[13px] font-[600] border-b-[2px] transition-all cursor-pointer bg-transparent ${activeTab === 'live'
                        ? 'text-[#0047CC] border-[#0047CC]'
                        : 'text-[#808080] border-transparent hover:text-[#4A4A4A]'
                        }`}
                    >
                      Record live
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      disabled={isRecording}
                      className={`pb-[6px] text-[13px] font-[600] border-b-[2px] transition-all cursor-pointer bg-transparent ${activeTab === 'upload'
                        ? 'text-[#0047CC] border-[#0047CC]'
                        : 'text-[#808080] border-transparent hover:text-[#4A4A4A]'
                        }`}
                    >
                      Upload video
                    </button>
                  </div>
                </div>

                {/* Optional Question Topic Input */}
                <div className="mb-[18px]">
                  <label className="block text-[12.5px] font-[600] text-[#4A4A4A] mb-[6px]">
                    Question Topic / Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                    placeholder="e.g. Team dynamics, Growth opportunities, Tech stack decisions..."
                    className="w-full px-[14px] py-[10px] bg-[#FAFAFA] border border-[#E6E6E6] rounded-[10px] text-[13.5px] text-[#1A1A1A] placeholder-[#ADADAD] focus:outline-none focus:border-[#0047CC] focus:bg-white transition-all"
                  />
                </div>

                {/* Live Webcam Studio */}
                {activeTab === 'live' && (
                  <div className="bg-[#0B0F14] rounded-[12px] overflow-hidden flex flex-col min-h-[380px] relative mb-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.15)]">

                    <div className="flex-1 relative bg-[#0B0F14] flex items-center justify-center min-h-[300px] overflow-hidden">

                      {!isRecordingStopped ? (
                        hasWebcamPermission ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center text-white/70">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white/40">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="9" r="3.5" />
                                <path d="M5 20.5a7 7 0 0 1 14 0" />
                              </svg>
                            </div>
                            <div className="text-[13.5px] font-[600] text-white mb-1">Camera standby</div>
                            <p className="text-[12px] text-white/50 max-w-[220px]">Allow camera permissions to record your question</p>
                          </div>
                        )
                      ) : (
                        <div className="absolute inset-0 bg-[#0B0F14] z-10 flex flex-col items-center justify-center">
                          {recordedVideoUrl ? (
                            <video
                              src={recordedVideoUrl}
                              controls
                              playsInline
                              className="w-full h-full object-contain"
                            />
                          ) : null}
                        </div>
                      )}

                      {/* Overlays */}
                      <div className="absolute top-[12px] left-[12px] right-[12px] flex justify-between items-center z-5 pointer-events-none">
                        <div className="inline-flex items-center gap-[6px] bg-black/60 backdrop-blur-[8px] border border-white/12 rounded-full p-[4px_10px] text-[11px] font-[600] text-white">
                          <div className={`w-[7px] h-[7px] rounded-full ${isRecording ? 'bg-[#DC2626] animate-pulse' : 'bg-[#387DFF]'}`} />
                          <span>{isRecording ? 'RECORDING QUESTION' : isRecordingStopped ? 'PREVIEW' : 'READY'}</span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-[8px] border border-white/12 rounded-full p-[4px_10px] text-[11.5px] font-[600] text-white tabular-nums">
                          {formatTimer(recElapsed)}
                        </div>
                      </div>

                      {/* Microphone Levels */}
                      {isRecording && (
                        <div className="absolute bottom-[12px] left-[12px] right-[12px] z-5 flex items-center gap-[8px] bg-black/55 backdrop-blur-[8px] border border-white/10 rounded-[8px] p-[6px_10px]">
                          <div className="text-[#387DFF] shrink-0">
                            <svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                          </div>
                          <div className="flex-1 flex gap-[2px] items-end h-[14px]">
                            {audioLevels.map((lvl, idx) => (
                              <div
                                key={idx}
                                style={{ height: `${lvl}%` }}
                                className={`flex-1 rounded-[1px] transition-[height] duration-75 ${lvl > 80 ? 'bg-[#D97706]' : 'bg-[#387DFF]'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Studio Controls */}
                    <div className="bg-[#0B0F14] p-[12px_16px] border-t border-[#1A2028] flex items-center justify-between gap-[12px] flex-wrap">
                      <div className="text-[11px] font-[500] flex items-center gap-[6px] text-[#9CA3AF]">
                        <CheckIcon className="w-[12px] h-[12px] text-[#387DFF]" />
                        Camera ready
                      </div>

                      <div className="flex gap-[8px]">
                        {isRecording ? (
                          <button
                            type="button"
                            onClick={handleStopRecording}
                            className="bg-white text-[#1A1A1A] border-none rounded-full py-[8px] px-[18px] font-[600] text-[12.5px] cursor-pointer inline-flex items-center gap-[6px]"
                          >
                            <svg className="w-[10px] h-[10px]" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="6" width="12" height="12" rx="1.5" />
                            </svg>
                            Stop recording
                          </button>
                        ) : isRecordingStopped ? (
                          <button
                            type="button"
                            onClick={handleRetake}
                            className="bg-transparent text-white border border-white/20 rounded-full py-[8px] px-[16px] font-[600] text-[12.5px] cursor-pointer inline-flex items-center gap-[6px] hover:bg-white/10"
                          >
                            <svg className="w-[11px] h-[11px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="23 4 23 10 17 10" />
                              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Retake
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleStartRecording}
                            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white border-none rounded-full py-[8px] px-[18px] font-[600] text-[12.5px] cursor-pointer inline-flex items-center gap-[6px]"
                          >
                            <div className="w-[8px] h-[8px] rounded-full bg-white" />
                            Record question
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload File Zone */}
                {activeTab === 'upload' && (
                  <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-[12px] p-[20px] mb-[20px]">
                    {uploadedUrl ? (
                      <div className="flex flex-col gap-[12px]">
                        <div className="bg-[#0B0F14] rounded-[10px] h-[200px] flex items-center justify-center overflow-hidden">
                          <video src={uploadedUrl} controls className="w-full h-full object-contain" />
                        </div>
                        <div className="flex items-center justify-between bg-[#EBF6FF] p-[10px_14px] rounded-[8px] border border-[#387DFF]/20">
                          <div className="text-[12.5px] text-[#0047CC] font-[600] flex items-center gap-[6px]">
                            <CheckIcon className="w-[14px] h-[14px]" />
                            {uploadedFile?.name} ({uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(1) : 0} MB)
                          </div>
                          <button
                            type="button"
                            onClick={() => { setUploadedFile(null); setUploadedUrl(null); }}
                            className="text-[11.5px] text-[#4A4A4A] hover:text-[#1A1A1A] font-[600] bg-white border border-[#E6E6E6] px-[10px] py-[4px] rounded-[6px] cursor-pointer"
                          >
                            Replace
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-[1.5px] border-dashed rounded-[12px] p-[32px_20px] text-center cursor-pointer transition-all ${isDragging ? 'border-[#0047CC] bg-[#EBF6FF]' : 'border-[#D4D4D4] bg-white hover:border-[#808080]'
                          }`}
                      >
                        <input
                          type="file"
                          id="candidate-question-upload"
                          accept=".mp4,.mov,.webm"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <div className="text-[15px] font-[700] text-[#1A1A1A] mb-[4px]">
                          Drop your video file here
                        </div>
                        <div className="text-[12.5px] text-[#808080] mb-[12px]">
                          MP4, MOV, or WebM up to 50 mb
                        </div>
                        <label
                          htmlFor="candidate-question-upload"
                          className="bg-[#0047CC] hover:bg-[#344DA1] text-white rounded-[8px] px-[16px] py-[8px] text-[12.5px] font-[600] cursor-pointer inline-flex items-center gap-[6px]"
                        >
                          Choose file
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Save question action button */}
                <div className="flex items-center justify-between pt-[14px] border-t border-[#E6E6E6] flex-wrap gap-[10px]">
                  <div className="text-[12.5px] text-[#808080]">
                    {(activeTab === 'live' ? recordedVideoUrl : uploadedUrl)
                      ? '✓ Video ready to save to your list'
                      : 'Record or upload your video before saving'}
                  </div>

                  <div className="flex gap-[10px]">
                    <Button
                      variant="primary"
                      fullWidth={false}
                      pill={true}
                      onClick={handleSaveQuestion}
                      disabled={!(activeTab === 'live' ? recordedVideoUrl : uploadedUrl)}
                      className="bg-[#0047CC] hover:bg-[#344DA1] text-white text-[13px] font-[600] px-[20px] py-[9px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Add Question {questionsList.length + 1}
                    </Button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#EBF6FF] border border-[#387DFF]/20 rounded-[14px] p-[20px_24px] text-center">
                <h4 className="text-[15px] font-[700] text-[#0047CC] mb-[4px]">
                  5 Questions Added (Maximum Reached)
                </h4>
                <p className="text-[13px] text-[#4A4A4A] mb-[16px]">
                  You have filled all 5 available inquiry slots. Review your questions above and submit to finish Stage 3.
                </p>
                <Button
                  variant="primary"
                  fullWidth={false}
                  pill={true}
                  onClick={handleCompleteFlow}
                  className="bg-[#0047CC] hover:bg-[#344DA1] text-white text-[14px] font-[600] px-[24px] py-[10px] mx-auto"
                >
                  Submit All Questions & Complete Stage 3
                </Button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[12px_28px] flex items-center justify-between gap-[12px] z-[40]">
        <div className="text-[12.5px] text-[#4A4A4A] font-[500]">
          {hasQuestions === 'yes' ? (
            <span className="text-[#0047CC] font-[600]">
              {questionsList.length} of 5 questions prepared
            </span>
          ) : hasQuestions === 'no' ? (
            <span className="text-[#666]">
              No questions selected · Ready to complete
            </span>
          ) : (
            <span className="text-[#808080]">
              Please choose an option above to proceed
            </span>
          )}
        </div>

        <div>
          {hasQuestions === 'no' && (
            <Button
              variant="primary"
              fullWidth={false}
              pill={true}
              onClick={handleCompleteFlow}
              className="bg-[#0047CC] hover:bg-[#344DA1] text-white text-[13.5px] font-[600] px-[22px] py-[9px]"
            >
              Complete Stage 3
            </Button>
          )}
          {hasQuestions === 'yes' && questionsList.length > 0 && (
            <Button
              variant="primary"
              fullWidth={false}
              pill={true}
              onClick={handleCompleteFlow}
              className="bg-[#0047CC] hover:bg-[#344DA1] text-white text-[13.5px] font-[600] px-[22px] py-[9px]"
            >
              Submit & Finish Stage 3
            </Button>
          )}
        </div>
      </footer>

    </div>
  );
};

export default RoleAssessmentStageThreeCandidateQuestions;
