import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import Button from '../../components/common/Button';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';
import {
  startGate3Session,
  fetchGate3Items,
  uploadGate3Video,
  submitComponentResponses,
} from '../../services/queries/assessments';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { VORA_LOGO_SRC } from '../../constants/brand';
import type { Gate3Item } from '../../services/queries/assessments/types';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
  </svg>
);

const ClockPlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 16 14"/>
  </svg>
);

const RoleAssessmentStageThreeVideo: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  // Feature enforcement toggles from env (default to true)
  const ENABLE_STAGE3_HARD_CAP = import.meta.env.VITE_ENABLE_STAGE3_HARD_CAP !== 'false';
  const ENABLE_STAGE3_RETAKE_LIMIT = import.meta.env.VITE_ENABLE_STAGE3_RETAKE_LIMIT !== 'false';

  const { data: roleResponse } = useGetPublicRoleQuery(roleSlug || '');
  const roleData = roleResponse?.data || roleResponse;
  const companyName = roleData?.companyName || 'The hiring team';

  // API State
  const [isPreparingContent, setIsPreparingContent] = useState<boolean>(true);
  const [componentId, setComponentId] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<Gate3Item | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 1, total: 6 });
  const [scoringReady, setScoringReady] = useState<boolean>(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState<boolean>(false);
  const recordedBlobRef = useRef<Blob | null>(null);
  const allItemsRef = useRef<Gate3Item[]>([]);

  // Question State
  const [takesCount, setTakesCount] = useState<number>(0);

  // Reset takes count whenever current question changes
  useEffect(() => {
    setTakesCount(0);
  }, [currentItem?.id]);

  // Derived Prompt fields strictly from backend
  const currentPromptText = currentItem?.content?.prompt || '';
  const defaultContext = companyName ? `${companyName} wants to see how you synthesize complicated scenarios without losing the core message. Focus on structural details and clear transitions.` : '';
  const currentContextText = currentItem?.content?.context || defaultContext;
  const currentCategoryTag = currentItem?.content?.category || currentItem?.type || 'Video prompt';
  const isRelationalType = currentItem?.type === 'video_relational';
  const personaText = currentItem?.content?.persona;
  const scenarioText = currentItem?.content?.scenario;
  const currentNum = currentItem?.sequence || progress.current || 1;
  const totalNum = currentItem?.total || progress.total || 6;
  const eyebrowText = currentItem?.eyebrow || `Question ${currentNum} · How you show up`;
  const suggestedLengthText = currentItem?.content?.suggestedLength || '1 to 2 minutes';

  const [apiError, setApiError] = useState<string | null>(null);

  // Start Gate 3 session & poll GET /gates/3/items until contentReady === true
  useEffect(() => {
    let pollInterval: any = null;
    let isCancelled = false;

    const initGate3 = async () => {
      if (!assessmentId) {
        setIsPreparingContent(false);
        setApiError('No active assessment session found.');
        return;
      }
      try {
        const rawRes: any = await startGate3Session(assessmentId);
        if (isCancelled) return;
        const res = rawRes?.data || rawRes;

        if (res?.componentId) setComponentId(res.componentId);
        if (res?.progress) setProgress(res.progress);
        setScoringReady(!!res?.scoringReady);

        if (res?.items && Array.isArray(res.items)) {
          allItemsRef.current = res.items;
        }

        if (res?.contentReady && res?.items && res.items.length > 0) {
          const currentSeq = res.progress?.current || 1;
          const activeItem = res.items.find((it: Gate3Item) => it.sequence === currentSeq) || res.items[0];
          setCurrentItem(activeItem);
          setIsPreparingContent(false);
          const readSecs = activeItem.content?.readingTimeSecs || 30;
          const recSecs = activeItem.content?.recordingTimeSecs || 180;
          setThinkTimeLeft(readSecs);
          setSecondsLeft(recSecs);
        } else {
          setIsPreparingContent(true);
          // Poll every 2.5s
          pollInterval = setInterval(async () => {
            try {
              const rawPoll: any = await fetchGate3Items(assessmentId);
              if (isCancelled) return;
              const pollRes = rawPoll?.data || rawPoll;

              if (pollRes?.componentId) setComponentId(pollRes.componentId);
              if (pollRes?.progress) setProgress(pollRes.progress);
              setScoringReady(!!pollRes?.scoringReady);

              if (pollRes?.items && Array.isArray(pollRes.items)) {
                allItemsRef.current = pollRes.items;
              }

              if (pollRes?.contentReady && pollRes?.items && pollRes.items.length > 0) {
                const currentSeq = pollRes.progress?.current || 1;
                const activeItem = pollRes.items.find((it: Gate3Item) => it.sequence === currentSeq) || pollRes.items[0];
                setCurrentItem(activeItem);
                setIsPreparingContent(false);
                const readSecs = activeItem.content?.readingTimeSecs || 30;
                const recSecs = activeItem.content?.recordingTimeSecs || 180;
                setThinkTimeLeft(readSecs);
                setSecondsLeft(recSecs);
                clearInterval(pollInterval);
              }
            } catch (err) {
              console.warn('Error polling Gate 3 items:', err);
            }
          }, 2500);
        }
      } catch (err: any) {
        console.error('Failed to start Gate 3 session:', err);
        setApiError(err?.message || 'Failed to initialize Stage 3 assessment from server.');
        setIsPreparingContent(false);
      }
    };

    initGate3();

    return () => {
      isCancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [assessmentId]);

  // Modes tab
  const [activeTab, setActiveTab] = useState<'live' | 'upload'>('live');

  // Answer capture status
  const [hasAnswer, setHasAnswer] = useState<boolean>(false);

  // Preparation / Think Time (30s)
  const [thinkTimeLeft, setThinkTimeLeft] = useState<number>(30);
  const [isThinking, setIsThinking] = useState<boolean>(true);

  // Answering / Recording Timers (counts down from 180s)
  const [secondsLeft, setSecondsLeft] = useState<number>(180);
  const [recElapsed, setRecElapsed] = useState<number>(0);

  // States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecordingStopped, setIsRecordingStopped] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [hasWebcamPermission, setHasWebcamPermission] = useState<boolean | null>(null);

  // File Upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Modals state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showCheatModal, setShowCheatModal] = useState<boolean>(false);
  const [cheatCountdown, setCheatCountdown] = useState<number>(3);

  // Encoding overlay loader
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Audio level bars heights
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 20, 45, 60, 40, 25, 55, 35, 10, 20, 15]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Timer: Think Time (Starts only when contentReady === true)
  useEffect(() => {
    let interval: any = null;
    if (!isPreparingContent && isThinking && thinkTimeLeft > 0 && !showCheatModal && !showSaveModal && !showSubmitModal) {
      interval = setInterval(() => {
        setThinkTimeLeft(prev => {
          if (prev <= 1) {
            handleStartAnswerFlow();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPreparingContent, isThinking, thinkTimeLeft, showCheatModal, showSaveModal, showSubmitModal]);

  // Timer: Answer countdown (counts down ONLY when actively recording)
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isRecordingStopped && !showCheatModal && !showSaveModal && !showSubmitModal) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (ENABLE_STAGE3_HARD_CAP && prev <= 1) {
            handleStopRecording();
            return 0;
          }
          return Math.max(0, prev - 1);
        });

        setRecElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isRecordingStopped, showCheatModal, showSaveModal, showSubmitModal]);

  // Tab change visibility listener (Anti-cheat)
  useEffect(() => {
    const ENABLE_ANTI_CHEAT_TAB_SWITCH = import.meta.env.VITE_ENABLE_ANTI_CHEAT_TAB_SWITCH === 'true';
    if (!ENABLE_ANTI_CHEAT_TAB_SWITCH) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!isThinking && !isRecordingStopped) {
          setShowCheatModal(true);
          setCheatCountdown(3);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isThinking, isRecordingStopped]);

  // Cheat Warning Countdown
  useEffect(() => {
    let interval: any = null;
    if (showCheatModal && cheatCountdown > 0) {
      interval = setInterval(() => {
        setCheatCountdown(prev => {
          if (prev <= 1) {
            handleCheatSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showCheatModal, cheatCountdown]);

  // Camera stream initiation
  useEffect(() => {
    if (activeTab === 'live' && !isRecordingStopped) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, currentItem?.id, isRecordingStopped]);

  // Visual audio bars levels rhythm
  useEffect(() => {
    let interval: any = null;
    if (activeTab === 'live' && isRecording) {
      interval = setInterval(() => {
        setAudioLevels(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
      }, 140);
    } else {
      setAudioLevels([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, activeTab]);

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

  // Preparation skip / Start
  const handleStartAnswerFlow = () => {
    setIsThinking(false);
    if (activeTab === 'live') {
      handleStartRecording();
    }
  };

  const handleStartRecording = async () => {
    setRecordedVideoUrl(null);
    recordedBlobRef.current = null;
    setIsRecordingStopped(false);
    setRecElapsed(0);
    const recCap = currentItem?.content?.recordingTimeSecs || 180;
    setSecondsLeft(recCap);
    chunksRef.current = [];

    let stream = streamRef.current;
    if (!stream || !stream.active) {
      stream = await startCamera();
    }

    if (!stream) {
      toast.error('Unable to access camera or microphone. Please allow camera permissions.');
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
        const file = new File(chunksRef.current, 'video-response.webm', { type: cleanType });
        recordedBlobRef.current = file;
        const url = URL.createObjectURL(file);
        setRecordedVideoUrl(url);
        setIsRecordingStopped(true);
        setHasAnswer(true);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTakesCount(prev => prev + 1);
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
        toast.success('Recording captured! You can preview or submit now.');
      } catch (err) {
        console.error('Error stopping MediaRecorder:', err);
      }
    }
    setIsRecording(false);
  };

  const handleRetake = () => {
    if (ENABLE_STAGE3_RETAKE_LIMIT && takesCount >= 2) {
      toast.error('Maximum retakes reached (2 takes used).');
      return;
    }
    setRecordedVideoUrl(null);
    recordedBlobRef.current = null;
    setIsRecordingStopped(false);
    setIsRecording(false);
    setHasAnswer(false);
    const recCap = currentItem?.content?.recordingTimeSecs || 180;
    setSecondsLeft(recCap);
    setRecElapsed(0);
    handleStartRecording();
  };

  const handleSwitchTab = (tab: 'live' | 'upload') => {
    if (isRecording) {
      toast.error('Please stop recording before switching modes.');
      return;
    }
    setActiveTab(tab);
  };

  // Upload zones drag and drop handlers
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
      toast.error('File size exceeds the 200MB limit!');
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedUrl(url);
    setHasAnswer(true);
    toast.success('Video upload validated.');
  };

  const handleReplaceUpload = () => {
    setUploadedFile(null);
    setUploadedUrl(null);
    setHasAnswer(false);
  };

  // Auto-submit from cheat rules violation
  const handleCheatSubmit = () => {
    setShowCheatModal(false);
    toast.error('Tab focus loss. Current state auto-submitted.');
    executeSubmitFlow();
  };

  const handleCheatResume = () => {
    setShowCheatModal(false);
    toast.success('Returned to video interview.');
  };

  // Confirm and Submit current answer
  const handleConfirmSubmit = () => {
    if (isSubmittingVideo) return;
    setShowSubmitModal(false);
    executeSubmitFlow();
  };

  const executeSubmitFlow = async () => {
    if (isSubmittingVideo) return;
    const currentItemId = currentItem?.id;
    try {
      setIsSubmittingVideo(true);
      const videoPayload = uploadedFile || recordedBlobRef.current;

      let uploadRes: any;

      if (assessmentId && currentItemId && videoPayload) {
        try {
          uploadRes = await uploadGate3Video(assessmentId, currentItemId, videoPayload);
        } catch (uploadErr: any) {
          const errStatus = uploadErr?.statusCode || uploadErr?.status || uploadErr?.response?.status || 0;
          // Any 400 or 409 means this prompt was already used/consumed — silently fetch next question
          if (errStatus === 400 || errStatus === 409) {
            toast.dismiss();
            console.warn(`Video prompt ${currentItemId} already consumed, fetching next question...`);
          } else {
            throw uploadErr;
          }
        }
      }

      const targetCompId = uploadRes?.componentId || componentId;

      if (uploadRes?.scoringReady && targetCompId && assessmentId) {
        runCompletionLoader(targetCompId);
        return;
      }

      // Fetch next questions from backend GET /gates/3/items
      if (assessmentId) {
        try {
          const rawNextItems: any = await fetchGate3Items(assessmentId);
          const nextItemsRes = rawNextItems?.data || rawNextItems;
          
          if (nextItemsRes?.scoringReady) {
            runCompletionLoader(nextItemsRes.componentId || targetCompId || 'gate3_component');
            return;
          }

          const backendItems: Gate3Item[] = nextItemsRes?.items || [];
          if (backendItems.length > 0) {
            // Find next item that isn't the one we just submitted
            let nextItem = backendItems.find(
              it => it.id !== currentItemId && it.sequence > (currentItem?.sequence || 0)
            );
            if (!nextItem) {
              nextItem = backendItems.find(it => it.id !== currentItemId);
            }
            // If still not found by ID, advance to the next in list or fallback
            if (!nextItem && backendItems.length > 1) {
              const currentIdx = backendItems.findIndex(it => it.id === currentItemId);
              if (currentIdx >= 0 && currentIdx + 1 < backendItems.length) {
                nextItem = backendItems[currentIdx + 1];
              }
            }

            if (nextItem) {
              setCurrentItem(nextItem);
              if (nextItemsRes.progress) {
                setProgress(nextItemsRes.progress);
              } else {
                setProgress(prev => ({ ...prev, current: nextItem.sequence }));
              }
              const readSecs = nextItem.content?.readingTimeSecs || 30;
              const recSecs = nextItem.content?.recordingTimeSecs || 180;
              setThinkTimeLeft(readSecs);
              setSecondsLeft(recSecs);
              setIsThinking(true);
              toast.dismiss();
              return;
            }
          }
        } catch (fetchErr) {
          console.warn('Error fetching next Gate 3 items:', fetchErr);
        }
      }

      // If backend explicitly marked scoringReady or no more items
      if (scoringReady) {
        runCompletionLoader(targetCompId || 'gate3_component');
      }
    } catch (err: any) {
      console.error('Failed to submit Stage 3 video response:', err);
      toast.error('Failed to upload video response. Please retry.');
    } finally {
      setIsSubmittingVideo(false);
      stopCamera();
      setRecordedVideoUrl(null);
      recordedBlobRef.current = null;
      setIsRecordingStopped(false);
      setIsRecording(false);
      setUploadedFile(null);
      setUploadedUrl(null);
      setHasAnswer(false);
    }
  };

  const runCompletionLoader = (finalComponentId?: string) => {
    setIsCompiling(true);
    
    setTimeout(async () => {
      const compId = finalComponentId || componentId;
      if (assessmentId && compId) {
        try {
          await submitComponentResponses(assessmentId, compId, {});
        } catch (err: any) {
          console.error('Error submitting Stage 3 component:', err);
          const errStatus = err?.statusCode || err?.status || 0;
          if (errStatus === 400) {
            toast.dismiss();
            setIsCompiling(false);
            try {
              const rawItems: any = await fetchGate3Items(assessmentId);
              const itemsRes = rawItems?.data || rawItems;
              if (itemsRes?.items && itemsRes.items.length > 0) {
                const curSeq = itemsRes.progress?.current || 1;
                const nextItem = itemsRes.items.find((it: Gate3Item) => it.sequence === curSeq) || itemsRes.items[0];
                setCurrentItem(nextItem);
                if (itemsRes.progress) setProgress(itemsRes.progress);
                const readSecs = nextItem.content?.readingTimeSecs || 30;
                const recSecs = nextItem.content?.recordingTimeSecs || 180;
                setThinkTimeLeft(readSecs);
                setSecondsLeft(recSecs);
                setIsThinking(true);
              }
            } catch (fetchErr) {
              console.warn('Failed to re-fetch items after submit rejection:', fetchErr);
            }
            return;
          }
        }
      }
      localStorage.setItem('vora_stage3_completed', 'true');
      localStorage.setItem('vora_stage4_unlocked', 'true');
      setIsCompiling(false);
      toast.success('Stage 3 video assessment completed!');
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-3/complete`);
    }, 4200);
  };

  const handleSaveAndConfirmExit = () => {
    setShowSaveModal(false);
    stopCamera();
    toast.success('Interview progress successfully auto-saved.');
    navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer chip color style logic
  const getTimerChipClass = () => {
    if (secondsLeft <= 30) return 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626] animate-pulse';
    if (secondsLeft <= 60) return 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]';
    return 'bg-[#EBF6FF] border-[#387DFF] text-[#0047CC]';
  };

  if (isCompiling) {
    return (
      <AssessmentAnalyzingView
        roleSlug={roleSlug}
        title="Scoring Stage 3"
        subtitle="We're compiling and analyzing your video interview responses."
        steps={[
          'Saving final question feed',
          'Encoding video chunks to H.264 MP4',
          'Verifying audio stream decibels',
          'Analyzing communication clarity and delivery',
          'Compiling assessment submission package',
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

  if (isPreparingContent || !currentItem) {
    if (apiError) {
      return (
        <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E6E6E6] max-w-md w-full">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Unable to load questions</h2>
            <p className="text-sm text-[#666] mb-6">{apiError}</p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }
    return <FullPageSpinner message="Preparing your video interview questions..." />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none">
      
      {/* Topbar */}
      <AssessmentHeader
        middleContent={`Stage 3 · Video interview · Question ${currentNum} of ${totalNum}`}
        rightContent={
          <div className="flex items-center gap-[14px]">
            <div className={`flex items-center gap-[7px] border-[1.5px] rounded-full p-[6px_14px] font-[800] text-[13.5px] tabular-nums transition-all ${getTimerChipClass()}`}>
              <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/>
                <polyline points="12 7 12 12 16 14"/>
              </svg>
              <span>{isThinking ? `Think: ${thinkTimeLeft}s` : formatTimer(secondsLeft)}</span>
            </div>
            <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
              <svg className="text-[#0047CC] w-[13px] h-[13px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Auto-saved
            </div>
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={3} greenDone={false} showBottomBorder={false} />

      {/* Question pebble rail */}
      <div className="bg-gradient-to-b from-white to-[#FBFCFF] border-b border-[#E6E6E6] p-[12px_32px] flex items-center justify-center gap-[8px] flex-wrap">
        {Array.from({ length: totalNum }).map((_, idx) => {
          const qNum = idx + 1;
          const isActive = qNum === currentNum;
          const isDone = qNum < currentNum;
          return (
            <div 
              key={qNum}
              className={`flex items-center gap-[7px] p-[6px_12px] rounded-full border-[1.5px] text-[11.5px] font-[700] transition-all duration-200 ${
                isDone 
                  ? 'bg-[#EBF6FF] border-[#387DFF]/30 text-[#0047CC]' 
                  : isActive 
                  ? 'border-[#0047CC] bg-[#EBF6FF] text-[#0047CC] shadow-[0_0_0_3px_rgba(0,71,204,0.08)]' 
                  : 'border-[#E6E6E6] text-[#ADADAD]'
              }`}
            >
              <div className={`w-[18px] h-[18px] rounded-full text-[9px] font-[900] flex items-center justify-center shrink-0 text-white ${
                isDone || isActive ? 'bg-[#0047CC]' : 'bg-[#ADADAD]'
              }`}>
                {isDone ? <CheckIcon className="w-[9px] h-[9px]" /> : qNum}
              </div>
              Question {qNum}
            </div>
          );
        })}
      </div>

      {/* Main Workspace Layout */}
      <main className="max-w-[1180px] w-full mx-auto p-[28px_28px_90px]">
        
        {/* Question Reveal Card */}
        <div className="bg-gradient-to-br from-[#182348] via-[#344DA1] to-[#0047CC] text-white rounded-[18px] p-[30px_34px_32px] relative overflow-hidden mb-[22px] shadow-[0_12px_36px_rgba(10,17,114,0.18)]">
          <div className="absolute top-[-60px] right-[-50px] w-[200px] h-[200px] rounded-full bg-white/[0.05]" />
          <div className="absolute bottom-[-60px] left-[-30px] w-[140px] h-[140px] rounded-full bg-white/[0.04]" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-[16px] gap-[14px] flex-wrap">
              <div className="flex items-center gap-[10px]">
                <div className="inline-flex items-center justify-center w-[36px] h-[36px] rounded-[10px] bg-white/[0.16] border border-white/[0.22] font-[900] text-[14px] backdrop-blur-[8px]">
                  {currentNum.toString().padStart(2, '0')}
                </div>
                <div>
                  <div className="text-[11px] font-[800] tracking-[1px] uppercase text-white/70">{eyebrowText}</div>
                  <div className="text-[12.5px] font-[700] text-white/88">{currentNum} of {totalNum} · {currentCategoryTag}</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-[7px] bg-white/[0.16] border border-white/[0.24] rounded-full p-[5px_12px] font-[800] text-[11px] uppercase">
                {currentCategoryTag}
              </div>
            </div>

            <div className="text-[23px] font-[900] tracking-[-0.3px] leading-[1.35] mb-[14px]">
              {currentPromptText}
            </div>

            {isRelationalType && personaText && (
              <div className="bg-white/[0.14] border border-white/[0.24] rounded-[10px] p-[13px_16px] mb-[14px]">
                <div className="text-[11px] font-[800] uppercase tracking-[0.6px] text-white/70 mb-1">Persona & Scenario</div>
                <div className="text-[13.5px] font-[700] text-white mb-1">{personaText}</div>
                {scenarioText && <div className="text-[12.5px] text-white/88 leading-[1.5]">{scenarioText}</div>}
              </div>
            )}

            {currentContextText && (
              <div className="bg-white/[0.1] border border-white/[0.2] rounded-[10px] p-[13px_16px] flex gap-[11px] items-start mb-[18px]">
                <InfoIcon className="w-[16px] h-[16px] text-[#387DFF] shrink-0 mt-[2px]" />
                <div className="text-[13px] leading-[1.55] text-white/88">
                  <strong>Why we ask · </strong>{currentContextText}
                </div>
              </div>
            )}

            <div className="flex gap-[8px] flex-wrap">
              <div className="flex-1 min-w-[130px] bg-white/[0.08] border border-white/[0.14] rounded-[10px] p-[9px_13px]">
                <div className="text-[9.5px] font-[800] uppercase tracking-[0.6px] text-white/60 mb-[3px]">Suggested length</div>
                <div className="text-[14px] font-[900] text-white flex items-center gap-[6px]">
                  <ClockPlayIcon className="w-[13px] h-[13px] text-[#387DFF]" />
                  {suggestedLengthText}
                </div>
              </div>
              <div className="flex-1 min-w-[130px] bg-white/[0.08] border border-white/[0.14] rounded-[10px] p-[9px_13px]">
                <div className="text-[9.5px] font-[800] uppercase tracking-[0.6px] text-white/60 mb-[3px]">Hard cap</div>
                <div className="text-[14px] font-[900] text-white">2:00</div>
              </div>
              <div className="flex-1 min-w-[130px] bg-white/[0.08] border border-white/[0.14] rounded-[10px] p-[9px_13px]">
                <div className="text-[9.5px] font-[800] uppercase tracking-[0.6px] text-white/60 mb-[3px]">Attempts allowed</div>
                <div className="text-[14px] font-[900] text-white">
                  {!ENABLE_STAGE3_RETAKE_LIMIT
                    ? 'Unlimited (dev mode)'
                    : takesCount >= 2
                    ? '0 retakes left'
                    : takesCount === 1
                    ? '1 retake left'
                    : '1 retake (max 2 takes)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-white border-[1.5px] border-[#E6E6E6] rounded-[12px] p-[5px] mb-[20px] max-w-[480px] mx-auto">
          <button
            onClick={() => handleSwitchTab('live')}
            disabled={isRecording}
            className={`flex-1 py-[11px] px-[16px] rounded-[8px] font-bold text-[13px] flex items-center justify-center gap-[8px] transition-all border-none cursor-pointer ${
              activeTab === 'live'
                ? 'bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white shadow-[0_4px_12px_rgba(0,71,204,0.22)]'
                : 'bg-transparent text-[#808080] hover:text-[#1A1A1A]'
            }`}
          >
            <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            Record live
            <span className={`text-[9.5px] font-[900] px-2 py-[2px] rounded-full uppercase tracking-[0.4px] ${
              activeTab === 'live' ? 'bg-white/20 text-white' : 'bg-[#F7F7F7] text-[#808080]'
            }`}>
              Path 1
            </span>
          </button>
          <button
            onClick={() => handleSwitchTab('upload')}
            disabled={isRecording}
            className={`flex-1 py-[11px] px-[16px] rounded-[8px] font-bold text-[13px] flex items-center justify-center gap-[8px] transition-all border-none cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white shadow-[0_4px_12px_rgba(0,71,204,0.22)]'
                : 'bg-transparent text-[#808080] hover:text-[#1A1A1A]'
            }`}
          >
            <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload pre-recorded
            <span className={`text-[9.5px] font-[900] px-2 py-[2px] rounded-full uppercase tracking-[0.4px] ${
              activeTab === 'upload' ? 'bg-white/20 text-white' : 'bg-[#F7F7F7] text-[#808080]'
            }`}>
              Path 2
            </span>
          </button>
        </div>

        {/* Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_.9fr] gap-[18px] items-stretch">
          
          {/* Active Work Area */}
          <div className="flex flex-col">
            
            {/* Record Live Panel */}
            {activeTab === 'live' && (
              <div className="bg-[#0B0F14] rounded-[16px] overflow-hidden flex flex-col min-h-[460px] relative shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
                
                <div className="flex-1 relative bg-[#0B0F14] flex items-center justify-center min-h-[340px] overflow-hidden">
                  
                  {/* Preparing Think time overlay */}
                  {isThinking && (
                    <div className="absolute inset-0 bg-[#0B0F14]/95 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-sm">
                      <div className="relative w-[100px] h-[100px] mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[3px] border-white/10 border-t-[#0047CC] animate-spin" />
                        <span className="text-[26px] font-[900] tabular-nums text-white relative z-10">
                          {thinkTimeLeft}
                        </span>
                      </div>
                      <h3 className="text-[17px] font-[800] mb-1 text-white">Think time active</h3>
                      <p className="text-[12.5px] text-white/70 max-w-[340px] mb-6 leading-relaxed">
                        Prepare your answer. Recording will automatically begin when the timer runs down.
                      </p>
                      <Button
                        onClick={handleStartAnswerFlow}
                        variant="primary"
                        pill={false}
                        className="bg-[#0047CC] hover:bg-[#344DA1] text-white border-none rounded-lg font-bold text-[13px] px-6 py-2 min-h-0"
                        fullWidth={false}
                      >
                        Start recording now
                      </Button>
                    </div>
                  )}

                  {/* Camera view or recorded playback */}
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
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white/40">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="9" r="3.5"/>
                            <path d="M5 20.5a7 7 0 0 1 14 0"/>
                          </svg>
                        </div>
                        <div className="text-[14px] font-bold text-white mb-1">Camera and mic standby</div>
                        <p className="text-[12px] text-white/50 max-w-[240px]">Allow camera permissions or start recording to begin</p>
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
                  {!isThinking && (
                    <>
                      <div className="absolute top-[14px] left-[14px] right-[14px] flex justify-between items-center z-5 pointer-events-none">
                        <div className="inline-flex items-center gap-[7px] bg-black/60 backdrop-blur-[8px] border border-white/12 rounded-full p-[5px_12px] text-[11.5px] font-[800] text-white">
                          <div className={`w-[8px] h-[8px] rounded-full ${isRecording ? 'bg-[#DC2626] animate-pulse' : 'bg-[#387DFF]'}`} />
                          <span>{isRecording ? 'RECORDING' : isRecordingStopped ? 'PREVIEWING' : 'STANDBY'}</span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-[8px] border border-white/12 rounded-full p-[5px_12px] text-[12px] font-[800] text-white tabular-nums">
                          {formatTimer(recElapsed)}
                        </div>
                      </div>

                      {/* Microphone Levels */}
                      <div className="absolute bottom-[14px] left-[14px] right-[14px] z-5 flex items-center gap-[10px] bg-black/55 backdrop-blur-[8px] border border-white/10 rounded-[10px] p-[8px_12px]">
                        <div className="text-[#387DFF] shrink-0">
                          <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                          </svg>
                        </div>
                        <div className="flex-1 flex gap-[2px] items-end h-[18px]">
                          {audioLevels.map((lvl, idx) => (
                            <div
                              key={idx}
                              style={{ height: `${lvl}%` }}
                              className={`flex-1 rounded-[1.5px] transition-[height] duration-75 ${
                                lvl > 80 ? 'bg-[#D97706]' : lvl > 90 ? 'bg-[#DC2626]' : 'bg-[#387DFF]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Live Controls */}
                <div className="bg-[#0B0F14] p-[18px_20px] border-t border-[#1A2028] flex items-center justify-between gap-[14px] flex-wrap">
                  <div className="text-[11.5px] font-[600] flex items-center gap-[10px] text-[#9CA3AF]">
                    <svg className="w-[14px] h-[14px] text-[#387DFF] stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Camera and mic active
                  </div>
                  
                  <div className="flex gap-[10px] flex-wrap">
                    {!isThinking && (
                      <>
                        {isRecording ? (
                          <button 
                            onClick={handleStopRecording}
                            className="bg-white text-[#1A1A1A] border-none rounded-[100px] py-[11px] px-[22px] font-extrabold text-[13.5px] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(255,255,255,0.18)]"
                          >
                            <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="6" width="12" height="12" rx="1.5"/>
                            </svg>
                            Stop recording
                          </button>
                        ) : isRecordingStopped ? (
                          <>
                            {(!ENABLE_STAGE3_RETAKE_LIMIT || takesCount < 2) && (
                              <button 
                                onClick={handleRetake}
                                className="bg-transparent text-white border-[1.5px] border-white/22 rounded-[100px] py-[10px] px-[18px] font-bold text-[13px] cursor-pointer inline-flex items-center gap-[7px] hover:bg-white/10"
                              >
                                <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <polyline points="23 4 23 10 17 10"/>
                                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                </svg>
                                {ENABLE_STAGE3_RETAKE_LIMIT ? 'Retake (1 left)' : 'Retake'}
                              </button>
                            )}
                          </>
                        ) : (
                          <button 
                            onClick={handleStartRecording}
                            className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white border-none rounded-[100px] py-[11px] px-[22px] font-extrabold text-[13.5px] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_6px_18px_rgba(220,38,38,0.32)]"
                          >
                            <div className="w-[11px] h-[11px] rounded-full bg-white inline-block" />
                            Record
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Pre-recorded Panel */}
            {activeTab === 'upload' && (
              <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] p-6 min-h-[460px] flex flex-col items-stretch">
                {uploadedUrl ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="bg-[#0B0F14] rounded-[12px] h-[240px] flex items-center justify-center relative overflow-hidden mb-[14px]">
                      <video 
                        src={uploadedUrl} 
                        controls
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-[10px] left-[10px] right-[10px] flex justify-between items-center z-[2]">
                        <div className="text-white text-[11.5px] font-[700] bg-black/55 backdrop-blur-[6px] p-[5px_11px] rounded-[6px] max-w-[60%] truncate">
                          {uploadedFile?.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-[14px_16px] bg-[#EBF6FF] border border-[#387DFF]/20 rounded-[10px] flex items-center gap-[11px]">
                      <CheckIcon className="w-[18px] h-[18px] text-[#0047CC] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-[800] text-[#1A1A1A] mb-[2px]">Uploaded · within limits</div>
                        <div className="text-[11.5px] text-[#0047CC] font-[600]">
                          {uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(1) : 0} MB · Ready to submit
                        </div>
                      </div>
                      <button 
                        onClick={handleReplaceUpload}
                        className="bg-white border border-[#E6E6E6] text-[#4A4A4A] p-[7px_14px] rounded-[8px] font-bold text-[12px] cursor-pointer inline-flex items-center gap-[5px] shrink-0 hover:bg-[#F7F7F7]"
                      >
                        <svg className="w-[11px] h-[11px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="23 4 23 10 17 10"/>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center p-[40px_30px] text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-[#0047CC] bg-[#EBF6FF]' 
                        : 'border-[#387DFF] bg-gradient-to-b from-[#FAFCFF] to-white hover:border-[#0047CC] hover:bg-[#EBF6FF]'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="file-upload-input" 
                      accept=".mp4,.mov,.webm"
                      className="hidden" 
                      onChange={handleFileSelect}
                    />
                    
                    <div className="w-[84px] h-[84px] rounded-[18px] bg-gradient-to-br from-[#EBF6FF] to-white border border-[#EBF6FF] flex items-center justify-center text-[#0047CC] mb-[16px] relative">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div className="text-[17px] font-[900] text-[#1A1A1A] mb-[6px] tracking-[-0.2px]">
                      Drop a pre-recorded video here
                    </div>
                    <div className="text-[13.5px] text-[#808080] leading-[1.55] mb-[18px] max-w-[340px]">
                      Or pick from your device. Recommended: under 2 minutes, well-lit, clear audio. We accept MP4, MOV and WebM up to 200MB.
                    </div>
                    <label 
                      htmlFor="file-upload-input"
                      className="bg-[#0047CC] text-white border-none rounded-[10px] p-[11px_22px] font-extrabold text-[13px] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.24)] hover:bg-[#344DA1]"
                    >
                      <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Choose video file
                    </label>
                    <div className="mt-[14px] flex gap-[6px] flex-wrap justify-center">
                      <span className="text-[10px] font-[700] bg-[#F7F7F7] text-[#808080] py-[3px] px-[8px] rounded-[6px] tracking-[0.4px]">MP4</span>
                      <span className="text-[10px] font-[700] bg-[#F7F7F7] text-[#808080] py-[3px] px-[8px] rounded-[6px] tracking-[0.4px]">MOV</span>
                      <span className="text-[10px] font-[700] bg-[#F7F7F7] text-[#808080] py-[3px] px-[8px] rounded-[6px] tracking-[0.4px]">WebM</span>
                      <span className="text-[10px] font-[700] bg-[#F7F7F7] text-[#808080] py-[3px] px-[8px] rounded-[6px] tracking-[0.4px]">200 MB max</span>
                      <span className="text-[10px] font-[700] bg-[#F7F7F7] text-[#808080] py-[3px] px-[8px] rounded-[6px] tracking-[0.4px]">2:00 max</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Companion Panel */}
          <aside className="flex flex-col gap-[14px]">
            
            <div className="border-[1.5px] border-[#0047CC] rounded-[14px] p-[16px_18px] flex gap-[11px] items-start bg-[#F4F8FF]">
              <svg className="w-[18px] h-[18px] text-[#0047CC] shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <div className="text-[13px] font-[800] text-[#0047CC] mb-[4px]">
                  {isThinking ? '30s think time running' : '30s think time used'}
                </div>
                <div className="text-[12px] text-[#0047CC] leading-[1.55]">
                  {isThinking 
                    ? 'Take a breath and structure your thoughts. Recording will start automatically or click skip.' 
                    : "Your answer timer is running. Speak at your natural pace. Don't worry about word-perfect."}
                </div>
              </div>
            </div>

            <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[18px_20px]">
              <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Tips for a strong answer</div>
              <div className="text-[14px] font-[800] text-[#1A1A1A] mb-[8px] tracking-[-0.1px]">A useful shape</div>
              <ul className="list-none flex flex-col gap-[8px] mt-[8px] p-0 m-0">
                <li className="text-[12px] text-[#4A4A4A] font-[600] pl-[18px] relative leading-[1.5] before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                  Briefly set the scene: where, when, what the problem or task was
                </li>
                <li className="text-[12px] text-[#4A4A4A] font-[600] pl-[18px] relative leading-[1.5] before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                  Name what challenges were faced in plain, structured language
                </li>
                <li className="text-[12px] text-[#4A4A4A] font-[600] pl-[18px] relative leading-[1.5] before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                  Walk us through what you did in the moment, including key decisions
                </li>
                <li className="text-[12px] text-[#4A4A4A] font-[600] pl-[18px] relative leading-[1.5] before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                  End with what outcome was achieved and key takeaways
                </li>
              </ul>
            </div>

            <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[18px_20px]">
              <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Honest reminder</div>
              <div className="text-[14px] font-[800] text-[#1A1A1A] mb-[8px] tracking-[-0.1px]">We're not grading polish</div>
              <div className="text-[12.5px] text-[#4A4A4A] leading-[1.6]">
                A small pause or a "let me think" doesn't count against you. We're listening for substance, structured thinking, and self-awareness, not a TED talk.
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="sticky bottom-0 bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[14px_32px] flex items-center justify-between gap-[12px] z-[40]">
        <div className="text-[12.5px] text-[#4A4A4A] font-[600] flex items-center gap-[10px]">
          {hasAnswer ? (
            <span className="inline-flex items-center gap-[6px] bg-[#EBF6FF] text-[#0047CC] border border-[#387DFF]/20 px-[13px] py-[6px] rounded-full text-[11.5px] font-[800]">
              <CheckIcon className="w-[11px] h-[11px]" />
              {activeTab === 'live' ? 'Recording captured · ready' : 'Video uploaded · ready'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-[6px] bg-[#F7F7F7] text-[#808080] px-[13px] py-[6px] rounded-full text-[11.5px] font-[800]">
              No answer captured yet
            </span>
          )}
          <span className="text-[#808080] text-[11.5px] font-[600]">
            Question {currentNum} of {totalNum}
          </span>
        </div>
        
        <div className="flex gap-[10px]">
          <button 
            onClick={() => setShowSaveModal(true)}
            disabled={isSubmittingVideo}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save and finish later
          </button>
          
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={!hasAnswer || isSubmittingVideo}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_26px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] disabled:bg-[#E6E6E6] disabled:text-[#ADADAD] disabled:cursor-not-allowed disabled:shadow-none hover:bg-[#344DA1] transition-all"
          >
            {isSubmittingVideo ? (
              <>
                <div className="w-[14px] h-[14px] rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                Uploading video...
              </>
            ) : (
              <>
                Submit answer
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* CHEAT MODAL OVERLAY */}
      {showCheatModal && (
        <div className="fixed inset-0 z-[200] bg-[#0A1129]/65 backdrop-blur-[6px] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[460px] w-full p-[30px_30px_26px] text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="w-[64px] h-[64px] bg-[#FEF2F2] text-[#DC2626] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FEF2F2]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#FEE2E2] text-[#B91C1C] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-3">
              Screen Focus Warning
            </div>
            <h3 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-2">
              Tab switch detected
            </h3>
            <p className="text-[13.5px] text-[#4A4A4A] leading-[1.6] mb-3">
              Navigating away from the interview screen triggers an automatic submission of your current question state.
            </p>
            <div className="text-[13px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5] p-2.5 rounded-lg mb-4">
              Auto-submitting in {cheatCountdown}s...
            </div>
            <p className="text-[12.5px] text-[#808080] leading-[1.5] mb-6">
              To pause properly, use <strong>Save and finish later</strong>. When you return, a fresh question will be generated.
            </p>
            <Button
              onClick={handleCheatResume}
              variant="primary"
              pill={false}
              className="bg-[#0047CC] hover:bg-[#344DA1] text-white border-none rounded-lg font-bold w-full"
            >
              Resume Interview
            </Button>
          </div>
        </div>
      )}

      {/* SAVE MODAL OVERLAY */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[200] bg-[#0A1129]/65 backdrop-blur-[6px] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[460px] w-full p-[30px_30px_26px] text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="w-[64px] h-[64px] bg-[#EBF6FF] text-[#0047CC] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EBF6FF]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <h3 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-2">
              Pause the video interview
            </h3>
            <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-2">
              Your submitted answers stay saved. The current question (Q{currentNum}) hasn't been submitted yet, so it'll be <strong>regenerated</strong> when you return.
            </p>
            <div className="flex gap-[10px] justify-center flex-wrap mt-6">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] py-[11px] px-[18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7]"
              >
                Keep going
              </button>
              <button 
                onClick={handleSaveAndConfirmExit}
                className="bg-[#0047CC] text-white border-none rounded-[10px] py-[11px] px-[18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#344DA1]"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT CONFIRMATION MODAL OVERLAY */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[200] bg-[#0A1129]/65 backdrop-blur-[6px] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[460px] w-full p-[30px_30px_26px] text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="w-[64px] h-[64px] bg-[#EBF6FF] text-[#0047CC] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EBF6FF]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-2">
              Submit your answer to Question {currentNum}?
            </h3>
            <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-2">
              Once submitted, this answer is locked in and the next question will unfurl. You can't return to this one.
            </p>
            <p className="text-[12.5px] text-[#808080] leading-[1.5] mb-6">
              Take a moment if you want to retake first.
            </p>
            <div className="flex gap-[10px] justify-center flex-wrap">
              <button 
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmittingVideo}
                className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] py-[11px] px-[18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] disabled:opacity-50"
              >
                Let me check it
              </button>
              <button 
                onClick={handleConfirmSubmit}
                disabled={isSubmittingVideo}
                className="bg-[#0047CC] text-white border-none rounded-[10px] py-[11px] px-[18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#344DA1] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmittingVideo && (
                  <div className="w-[14px] h-[14px] rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                )}
                {currentNum < totalNum ? `Yes, submit and unlock Q${currentNum + 1}` : 'Yes, submit and complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOADING VIDEO MODAL OVERLAY */}
      {isSubmittingVideo && !isCompiling && (
        <div className="fixed inset-0 z-[200] bg-[#0A1129]/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
          <div className="bg-white rounded-[20px] p-8 max-w-[420px] w-full shadow-[0_24px_80px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col items-center animate-fadeIn">
            <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[3.5px] border-[#0047CC]/15 border-t-[#0047CC] animate-spin" />
              <img
                src={VORA_LOGO_SRC}
                alt="VORA"
                className="w-10 h-10 object-contain animate-pulse relative z-10"
              />
            </div>
            <h3 className="text-[19px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-2">
              Uploading Video Answer
            </h3>
            <p className="text-[13.5px] text-[#4A4A4A] leading-relaxed mb-3">
              Your video answer is being uploaded and secured by the server.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#F7F7F7] text-[#808080] px-3.5 py-1.5 rounded-full text-[12px] font-bold">
              <div className="w-2 h-2 rounded-full bg-[#0047CC] animate-ping" />
              Please keep this tab open...
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoleAssessmentStageThreeVideo;
