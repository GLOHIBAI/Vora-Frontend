import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import Button from '../../components/common/Button';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';
import {
  startGate3Session,
  fetchGate3Items,
  fetchGate3ResumeState,
  uploadGate3Video,
  requestGate3UploadUrl,
  uploadDirectToCloudinary,
  completeGate3DirectUpload,
  submitComponentResponses,
} from '../../services/queries/assessments';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { VORA_LOGO_SRC } from '../../constants/brand';
import { BackgroundSpeechTranscriber } from '../../utils/backgroundSpeechTranscriber';
import type { Gate3Item } from '../../services/queries/assessments/types';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
);

const ClockPlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
);

const RoleAssessmentStageThreeVideo: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  // Feature enforcement toggles from env (default to false)
  const ENABLE_TIMER_EXPIRY = import.meta.env.VITE_ENABLE_TIMER_EXPIRY === 'true';
  const ENABLE_STAGE3_HARD_CAP = ENABLE_TIMER_EXPIRY && import.meta.env.VITE_ENABLE_STAGE3_HARD_CAP === 'true';
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
  const transcriberRef = useRef<BackgroundSpeechTranscriber>(new BackgroundSpeechTranscriber());
  const allItemsRef = useRef<Gate3Item[]>([]);
  const completedItemIdsRef = useRef<Set<string>>(new Set());
  /** Whether the backend signals 3-step direct upload instead of multipart */
  const [useDirectUpload, setUseDirectUpload] = useState<boolean>(false);

  // Question State
  const [takesCount, setTakesCount] = useState<number>(0);

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

  /**
   * Navigate to the next step by consulting resume-state.nextStep.
   * If there are still unanswered prompts (RESUME_ITEMS), presents the remaining question.
   * Directs candidate forward to candidate-questions (or complete) only when all core prompts are done.
   */
  const navigateByNextStep = async () => {
    const base = `/onboarding/talent/${roleSlug}/interview/stage-3`;
    try {
      const rawResume: any = await fetchGate3ResumeState(assessmentId);
      const resumeRes = rawResume?.data || rawResume;
      const step = resumeRes?.nextStep || '';

      if (step === 'STAGE3_COMPLETE' || step === 'GATE3_REVIEW' || resumeRes?.gate3Complete) {
        stopCamera();
        navigate(`${base}/complete`);
        return;
      }

      if (step === 'CANDIDATE_VOICE' || step === 'CANDIDATE_QUESTIONS') {
        stopCamera();
        navigate(`${base}/candidate-questions`);
        return;
      }

      // If backend says there are still unanswered core prompts (RESUME_ITEMS / GATE3_ITEMS)
      if (resumeRes?.items && resumeRes.items.length > 0) {
        const currentSeq = resumeRes.progress?.current || 1;
        const remainingItem = resumeRes.items.find((it: Gate3Item) => it.sequence === currentSeq) || resumeRes.items[0];
        if (remainingItem) {
          setCurrentItem(remainingItem);
          if (resumeRes.progress) setProgress(resumeRes.progress);
          const resumeUploads = resumeRes.videoUploads || {};
          const takes = resumeUploads[remainingItem.id]?.takeCount || 0;
          setTakesCount(takes);
          const readSecs = remainingItem.content?.readingTimeSecs || 30;
          const recSecs = remainingItem.content?.recordingTimeSecs || 180;
          setThinkTimeLeft(readSecs);
          setSecondsLeft(recSecs);
          setIsThinking(true);
          toast(`Please complete Question ${remainingItem.sequence} of ${resumeRes.progress?.total || 6} to finish Stage 3.`);
          return;
        }
      }

      stopCamera();
      navigate(`${base}/candidate-questions`);
    } catch {
      stopCamera();
      navigate(`${base}/candidate-questions`);
    }
  };

  // Start Gate 3 session & poll GET /gates/3/items until contentReady === true
  useEffect(() => {
    let pollInterval: any = null;
    let isCancelled = false;

    const initGate3 = async () => {
      if (!assessmentId) {
        setIsPreparingContent(false);
        setApiError('No active interview session found.');
        return;
      }
      try {
        const rawRes: any = await startGate3Session(assessmentId);
        if (isCancelled) return;
        const res = rawRes?.data || rawRes;

        if (res?.componentId) setComponentId(res.componentId);
        if (res?.progress) setProgress(res.progress);
        if (res?.directUpload !== undefined) setUseDirectUpload(!!res.directUpload);
        setScoringReady(!!res?.scoringReady);

        if (res?.items && Array.isArray(res.items)) {
          allItemsRef.current = res.items;
        }

        const videoUploads = res?.videoUploads || {};
        const totalItems = res?.progress?.total || 6;

        // If backend already marked scoringReady or all questions have recorded uploads
        if (res?.scoringReady || Object.keys(videoUploads).length >= totalItems) {
          setIsPreparingContent(false);
          await navigateByNextStep();
          return;
        }

        if (res?.contentReady && res?.items && res.items.length > 0) {
          const currentSeq = res.progress?.current || 1;
          const activeItem = res.items.find((it: Gate3Item) => it.sequence === currentSeq) || res.items[0];

          // If current item is the last question and already completed
          if (activeItem.sequence >= totalItems && videoUploads[activeItem.id]?.takeCount >= 2) {
            setIsPreparingContent(false);
            await navigateByNextStep();
            return;
          }

          setCurrentItem(activeItem);
          const initialTakes = videoUploads[activeItem.id]?.takeCount || 0;
          setTakesCount(initialTakes);
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
              if (pollRes?.directUpload !== undefined) setUseDirectUpload(!!pollRes.directUpload);
              setScoringReady(!!pollRes?.scoringReady);

              if (pollRes?.items && Array.isArray(pollRes.items)) {
                allItemsRef.current = pollRes.items;
              }

              const pollVideoUploads = pollRes?.videoUploads || {};
              const pollTotal = pollRes?.progress?.total || 6;

              if (pollRes?.scoringReady || Object.keys(pollVideoUploads).length >= pollTotal) {
                setIsPreparingContent(false);
                clearInterval(pollInterval);
                await navigateByNextStep();
                return;
              }

              if (pollRes?.contentReady && pollRes?.items && pollRes.items.length > 0) {
                const currentSeq = pollRes.progress?.current || 1;
                const activeItem = pollRes.items.find((it: Gate3Item) => it.sequence === currentSeq) || pollRes.items[0];

                if (activeItem.sequence >= pollTotal && pollVideoUploads[activeItem.id]?.takeCount >= 2) {
                  setIsPreparingContent(false);
                  clearInterval(pollInterval);
                  await navigateByNextStep();
                  return;
                }

                setCurrentItem(activeItem);
                const pollTakes = pollVideoUploads[activeItem.id]?.takeCount || 0;
                setTakesCount(pollTakes);
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
        // Fallback: If session was already active / started, recover from resume-state
        try {
          const rawResume: any = await fetchGate3ResumeState(assessmentId);
          if (isCancelled) return;
          const resumeRes = rawResume?.data || rawResume;

          if (resumeRes?.componentId) setComponentId(resumeRes.componentId);
          if (resumeRes?.progress) setProgress(resumeRes.progress);
          setScoringReady(!!resumeRes?.scoringReady);

          if (resumeRes?.items && Array.isArray(resumeRes.items)) {
            allItemsRef.current = resumeRes.items;
          }

          const resumeVideoUploads = resumeRes?.videoUploads || {};
          const resumeTotal = resumeRes?.progress?.total || 6;

          if (resumeRes?.scoringReady || Object.keys(resumeVideoUploads).length >= resumeTotal) {
            setIsPreparingContent(false);
            await navigateByNextStep();
            return;
          }

          if (resumeRes?.items && resumeRes.items.length > 0) {
            const currentSeq = resumeRes.progress?.current || 1;
            const activeItem = resumeRes.items.find((it: Gate3Item) => it.sequence === currentSeq) || resumeRes.items[0];

            if (activeItem.sequence >= resumeTotal && resumeVideoUploads[activeItem.id]?.takeCount >= 2) {
              setIsPreparingContent(false);
              await navigateByNextStep();
              return;
            }

            setCurrentItem(activeItem);
            const takes = resumeVideoUploads[activeItem.id]?.takeCount || 0;
            setTakesCount(takes);
            setIsPreparingContent(false);
            const readSecs = activeItem.content?.readingTimeSecs || 30;
            const recSecs = activeItem.content?.recordingTimeSecs || 180;
            setThinkTimeLeft(readSecs);
            setSecondsLeft(recSecs);
            return;
          }
        } catch (resumeErr) {
          console.warn('Resume-state fallback attempt failed:', resumeErr);
        }

        console.error('Failed to start Gate 3 session:', err);
        setApiError(err?.message || 'Failed to initialize Stage 3 interview from server.');
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

  // Collapsible panels (redesign)
  const [showWhyWeAsk, setShowWhyWeAsk] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(true);

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

  /**
   * Fix WebM blobs that lack duration metadata in the container header.
   * MediaRecorder-produced WebM files often report Infinity/NaN duration,
   * causing the native controls to show only elapsed time and the progress
   * bar to not sync. Seeking briefly to the end forces the browser to
   * calculate the real duration from the byte stream.
   */
  const handlePreviewLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!Number.isFinite(video.duration) || Number.isNaN(video.duration)) {
      video.currentTime = Number.MAX_SAFE_INTEGER;
      const onSeek = () => {
        video.removeEventListener('timeupdate', onSeek);
        video.currentTime = 0;
      };
      video.addEventListener('timeupdate', onSeek);
    }
  };

  // Timer: Think Time countdown (Starts only when contentReady === true)
  useEffect(() => {
    let interval: any = null;
    if (!isPreparingContent && isThinking && thinkTimeLeft > 0 && !showCheatModal && !showSaveModal && !showSubmitModal) {
      interval = setInterval(() => {
        setThinkTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPreparingContent, isThinking, thinkTimeLeft, showCheatModal, showSaveModal, showSubmitModal]);

  // Auto-start answer flow when think time runs out
  useEffect(() => {
    if (!isPreparingContent && isThinking && thinkTimeLeft === 0 && !showCheatModal && !showSaveModal && !showSubmitModal) {
      handleStartAnswerFlow();
    }
  }, [isPreparingContent, isThinking, thinkTimeLeft, showCheatModal, showSaveModal, showSubmitModal]);

  // Timer: Answer countdown (counts down ONLY when actively recording)
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isRecordingStopped && !showCheatModal && !showSaveModal && !showSubmitModal) {
      interval = setInterval(() => {
        setSecondsLeft(prev => Math.max(0, prev - 1));
        setRecElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isRecordingStopped, showCheatModal, showSaveModal, showSubmitModal]);

  // Auto-stop recording when hard cap time runs out
  useEffect(() => {
    if (ENABLE_STAGE3_HARD_CAP && isRecording && secondsLeft === 0) {
      handleStopRecording();
    }
  }, [ENABLE_STAGE3_HARD_CAP, isRecording, secondsLeft]);

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
        setCheatCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showCheatModal, cheatCountdown]);

  // Auto-submit on cheat countdown expiration
  useEffect(() => {
    if (showCheatModal && cheatCountdown === 0) {
      handleCheatSubmit();
    }
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

      let mediaRecorder: MediaRecorder;
      const recorderOptions: MediaRecorderOptions = {
        mimeType: mimeType || undefined,
        videoBitsPerSecond: 1000000, // 1.0 Mbps HD interview video
        audioBitsPerSecond: 64000,   // 64 kbps clear speech
      };

      try {
        mediaRecorder = new MediaRecorder(stream, recorderOptions);
      } catch {
        mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      }

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

      mediaRecorder.start(1000);
      setIsRecording(true);
      setTakesCount(prev => prev + 1);
      transcriberRef.current.start();
      toast.success('Live recording started');
    } catch (err: any) {
      console.error('MediaRecorder start error:', err);
      toast.error('Failed to start recording: ' + (err?.message || 'Error initializing recorder'));
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;

    transcriberRef.current.stop();

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
    transcriberRef.current.reset();
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
      toast.error('File size exceeds the 50 mb limit!');
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
          const transcript = transcriberRef.current.getTranscript();

          if (useDirectUpload) {
            // 3-step direct Cloudinary upload: get signed URL & fields → POST directly to Cloudinary → POST complete
            const rawType = videoPayload.type || 'video/webm';
            const contentType = rawType.split(';')[0].trim().toLowerCase() || 'video/webm';
            const ext = contentType.includes('mp4') ? 'mp4' : 'webm';
            const fileName = `response.${ext}`;

            const urlRes = await requestGate3UploadUrl(assessmentId, currentItemId, { contentType, fileName });
            await uploadDirectToCloudinary(urlRes.uploadUrl, videoPayload, fileName, urlRes.fields);

            // Step 3: Confirm completion
            uploadRes = await completeGate3DirectUpload(assessmentId, currentItemId, {
              uploadId: urlRes.uploadId,
              transcript,
            });
          } else {
            uploadRes = await uploadGate3Video(assessmentId, currentItemId, videoPayload, transcript);
          }
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

      if (currentItemId) {
        completedItemIdsRef.current.add(currentItemId);
      }

      const targetCompId = uploadRes?.componentId || componentId;
      const currentSequence = currentItem?.sequence || progress.current || 1;
      const totalCount = currentItem?.total || progress.total || 6;
      const targetNextSeq = uploadRes?.nextSequence || (currentSequence + 1);

      // 1. If this was the last question (e.g. Q6) or backend marked scoringReady / all uploaded
      if (
        uploadRes?.scoringReady ||
        currentSequence >= totalCount ||
        targetNextSeq > totalCount ||
        (uploadRes?.progress?.uploaded && uploadRes.progress.uploaded >= totalCount) ||
        (uploadRes?.window && !uploadRes.window.hasMore && currentSequence >= totalCount) ||
        completedItemIdsRef.current.size >= totalCount
      ) {
        await navigateByNextStep();
        return;
      }

      // 2. Use window / nextSequence hints from the upload response to fetch exactly the next prompt
      const fetchWindow = uploadRes?.window;
      const fetchParams = fetchWindow
        ? { from: fetchWindow.from, through: fetchWindow.through }
        : { from: targetNextSeq, through: targetNextSeq };

      let foundNextItem: Gate3Item | null = null;
      let nextVideoUploads: Record<string, any> = {};

      // Fetch next questions from backend GET /gates/3/items
      if (assessmentId) {
        try {
          const rawNextItems: any = await fetchGate3Items(assessmentId, fetchParams);
          const nextItemsRes = rawNextItems?.data || rawNextItems;

          if (nextItemsRes?.scoringReady) {
            await navigateByNextStep();
            return;
          }

          const backendItems: Gate3Item[] = nextItemsRes?.items || [];
          nextVideoUploads = nextItemsRes?.videoUploads || {};

          // Sync completed from videoUploads
          Object.keys(nextVideoUploads).forEach(id => {
            if (nextVideoUploads[id]?.takeCount >= 1) {
              completedItemIdsRef.current.add(id);
            }
          });

          // Accumulate into allItemsRef
          backendItems.forEach((it: Gate3Item) => {
            if (!allItemsRef.current.some(existing => existing.id === it.id)) {
              allItemsRef.current.push(it);
            }
          });

          // Priority 1: Match targetNextSeq from backendItems not completed
          foundNextItem = backendItems.find(
            it => !completedItemIdsRef.current.has(it.id) && it.sequence === targetNextSeq
          ) || null;

          // Priority 2: Any item in backendItems with sequence > currentSequence not completed
          if (!foundNextItem) {
            foundNextItem = backendItems.find(
              it => !completedItemIdsRef.current.has(it.id) && it.sequence > currentSequence
            ) || null;
          }

          // Priority 3: Any item in backendItems not in completedItemIdsRef
          if (!foundNextItem) {
            foundNextItem = backendItems.find(
              it => !completedItemIdsRef.current.has(it.id) && it.id !== currentItemId
            ) || null;
          }
        } catch (fetchErr) {
          console.warn('Error fetching next Gate 3 items:', fetchErr);
        }
      }

      // Priority 4: Search allItemsRef for targetNextSeq not completed
      if (!foundNextItem) {
        foundNextItem = allItemsRef.current.find(
          it => !completedItemIdsRef.current.has(it.id) && it.sequence === targetNextSeq
        ) || null;
      }

      // Priority 5: Search allItemsRef for any item sequence > currentSequence not completed
      if (!foundNextItem) {
        foundNextItem = allItemsRef.current.find(
          it => !completedItemIdsRef.current.has(it.id) && it.sequence > currentSequence
        ) || null;
      }

      // If a valid next item is found, transition to it cleanly
      if (foundNextItem) {
        setCurrentItem(foundNextItem);
        setProgress(prev => ({ ...prev, current: foundNextItem!.sequence }));
        const readSecs = foundNextItem.content?.readingTimeSecs || 30;
        const recSecs = foundNextItem.content?.recordingTimeSecs || 180;
        setThinkTimeLeft(readSecs);
        setSecondsLeft(recSecs);
        setIsThinking(true);
        const nextTakes = nextVideoUploads[foundNextItem.id]?.takeCount || 0;
        setTakesCount(nextTakes);
        toast.dismiss();
        return;
      }

      // If no next question exists and we've answered available questions:
      await navigateByNextStep();
      return;
    } catch (err: any) {
      console.error('Failed to submit Stage 3 video response:', err);
      toast.error('Failed to upload video response. Please retry.');
    } finally {
      setIsSubmittingVideo(false);
      stopCamera();
      transcriberRef.current.reset();
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
      toast.success('Stage 3 video interview completed!');
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
          'Compiling interview submission package',
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
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 16 14" />
              </svg>
              <span>{isThinking ? `Think: ${thinkTimeLeft}s` : formatTimer(secondsLeft)}</span>
            </div>
            <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
              <svg className="text-[#0047CC] w-[13px] h-[13px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Auto-saved
            </div>
          </div>
        }
      />

      {/* ── Segmented progress bar (replaces StageRail + question pills) ── */}
      <div className="bg-white border-b border-[#E6E6E6] px-[32px] py-[10px]">
        <div className="max-w-[1180px] mx-auto flex gap-[4px]">
          {Array.from({ length: totalNum }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-[4px] rounded-full transition-all duration-300 ${idx < currentNum ? 'bg-[#0047CC]' : 'bg-[#E6E6E6]'
                }`}
            />
          ))}
        </div>
      </div>

      {/* ── Main workspace ── */}
      <main className="max-w-[1180px] w-full mx-auto p-[28px_28px_100px]">

        {/* ── Question area + right panel split ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-[28px] items-start">

          {/* ── Left column: question → video ── */}
          <div className="flex flex-col gap-[20px]">

            {/* Metadata line — quiet, gray, inline */}
            <div className="flex items-center gap-[6px] text-[13px] text-[#808080] font-[500] flex-wrap">
              <span>Question {currentNum} of {totalNum}</span>
              <span className="text-[#D4D4D4]">·</span>
              <span>{currentCategoryTag === 'video_prompt' ? 'How you show up' : currentCategoryTag}</span>
              <span className="text-[#D4D4D4]">·</span>
              <span>{suggestedLengthText}</span>
              <span className="text-[#D4D4D4]">·</span>
              <span>
                {!ENABLE_STAGE3_RETAKE_LIMIT
                  ? 'Unlimited retakes'
                  : takesCount >= 2
                    ? '0 retakes left'
                    : takesCount === 1
                      ? '1 retake left'
                      : '1 retake allowed'}
              </span>
            </div>

            {/* ── THE QUESTION — dominant element ── */}
            <h1 className="text-[24px] font-[700] text-[#1A1A1A] leading-[1.4] tracking-[-0.3px] m-0">
              {currentPromptText}
            </h1>

            {/* Persona & scenario (relational prompts only) */}
            {isRelationalType && personaText && (
              <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-[12px] p-[16px_20px]">
                <div className="text-[12px] font-[600] text-[#808080] uppercase tracking-[0.5px] mb-[6px]">Persona & scenario</div>
                <div className="text-[14px] font-[600] text-[#1A1A1A] mb-[4px]">{personaText}</div>
                {scenarioText && <div className="text-[13px] text-[#666] leading-[1.55]">{scenarioText}</div>}
              </div>
            )}

            {/* "Why we ask" — collapsible disclosure */}
            {currentContextText && (
              <button
                onClick={() => setShowWhyWeAsk(prev => !prev)}
                className="w-full bg-[#FAFAFA] hover:bg-[#F5F5F5] border border-[#E6E6E6] rounded-[12px] p-[12px_16px] flex items-center gap-[10px] cursor-pointer transition-colors text-left"
              >
                <InfoIcon className="w-[15px] h-[15px] text-[#ADADAD] shrink-0" />
                <span className="flex-1 text-[13px] font-[500] text-[#808080]">Why we ask</span>
                <svg
                  className={`w-[14px] h-[14px] text-[#ADADAD] transition-transform duration-200 ${showWhyWeAsk ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
            {showWhyWeAsk && currentContextText && (
              <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-[12px] p-[14px_18px] -mt-[12px] text-[13px] text-[#666] leading-[1.6]">
                {currentContextText}
              </div>
            )}

            {/* ── Mode toggle — plain text tabs ── */}
            <div className="flex items-center gap-[24px] border-b border-[#E6E6E6] mt-[4px]">
              <button
                onClick={() => handleSwitchTab('live')}
                disabled={isRecording}
                className={`pb-[10px] text-[13.5px] font-[600] border-b-[2px] transition-all cursor-pointer bg-transparent ${activeTab === 'live'
                  ? 'text-[#0047CC] border-[#0047CC]'
                  : 'text-[#808080] border-transparent hover:text-[#4A4A4A]'
                  }`}
              >
                Record now
              </button>
              <button
                onClick={() => handleSwitchTab('upload')}
                disabled={isRecording}
                className={`pb-[10px] text-[13.5px] font-[600] border-b-[2px] transition-all cursor-pointer bg-transparent ${activeTab === 'upload'
                  ? 'text-[#0047CC] border-[#0047CC]'
                  : 'text-[#808080] border-transparent hover:text-[#4A4A4A]'
                  }`}
              >
                Upload a recording
              </button>
            </div>

            {/* ── Record live panel ── */}
            {activeTab === 'live' && (
              <div className="bg-[#0B0F14] rounded-[12px] overflow-hidden flex flex-col min-h-[420px] relative shadow-[0_8px_24px_rgba(0,0,0,0.15)]">

                <div className="flex-1 relative bg-[#0B0F14] flex items-center justify-center min-h-[320px] overflow-hidden">

                  {/* Think time overlay */}
                  {isThinking && (
                    <div className="absolute inset-0 bg-[#0B0F14]/95 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-sm">
                      <div className="relative w-[88px] h-[88px] mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[3px] border-white/10 border-t-[#0047CC] animate-spin" />
                        <span className="text-[24px] font-[700] tabular-nums text-white relative z-10">
                          {thinkTimeLeft}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-[700] mb-1 text-white">Think time</h3>
                      <p className="text-[13px] text-white/60 max-w-[320px] mb-5 leading-relaxed font-[400]">
                        Prepare your answer. Recording begins when the timer ends.
                      </p>
                      <Button
                        onClick={handleStartAnswerFlow}
                        variant="primary"
                        pill={false}
                        className="bg-[#0047CC] hover:bg-[#344DA1] text-white border-none rounded-[10px] font-[600] text-[13px] px-6 py-2 min-h-0"
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
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white/40">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="9" r="3.5" />
                            <path d="M5 20.5a7 7 0 0 1 14 0" />
                          </svg>
                        </div>
                        <div className="text-[14px] font-[600] text-white mb-1">Camera standby</div>
                        <p className="text-[12px] text-white/50 max-w-[240px] font-[400]">Allow camera permissions to begin</p>
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
                          onLoadedMetadata={handlePreviewLoadedMetadata}
                        />
                      ) : null}
                    </div>
                  )}

                  {/* Recording overlays */}
                  {!isThinking && (
                    <>
                      <div className="absolute top-[12px] left-[12px] right-[12px] flex justify-between items-center z-5 pointer-events-none">
                        <div className="inline-flex items-center gap-[6px] bg-black/60 backdrop-blur-[8px] border border-white/12 rounded-full p-[5px_12px] text-[11px] font-[600] text-white">
                          <div className={`w-[7px] h-[7px] rounded-full ${isRecording ? 'bg-[#DC2626] animate-pulse' : 'bg-[#387DFF]'}`} />
                          <span>{isRecording ? 'RECORDING' : isRecordingStopped ? 'PREVIEW' : 'STANDBY'}</span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-[8px] border border-white/12 rounded-full p-[5px_12px] text-[12px] font-[600] text-white tabular-nums">
                          {formatTimer(recElapsed)}
                        </div>
                      </div>

                      {/* Audio levels */}
                      <div className="absolute bottom-[12px] left-[12px] right-[12px] z-5 flex items-center gap-[8px] bg-black/55 backdrop-blur-[8px] border border-white/10 rounded-[10px] p-[7px_12px]">
                        <div className="text-[#387DFF] shrink-0">
                          <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                          </svg>
                        </div>
                        <div className="flex-1 flex gap-[2px] items-end h-[16px]">
                          {audioLevels.map((lvl, idx) => (
                            <div
                              key={idx}
                              style={{ height: `${lvl}%` }}
                              className={`flex-1 rounded-[1.5px] transition-[height] duration-75 ${lvl > 80 ? 'bg-[#D97706]' : lvl > 90 ? 'bg-[#DC2626]' : 'bg-[#387DFF]'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Controls bar */}
                <div className="bg-[#0B0F14] p-[14px_18px] border-t border-[#1A2028] flex items-center justify-between gap-[12px] flex-wrap">
                  <div className="text-[11px] font-[500] flex items-center gap-[8px] text-[#9CA3AF]">
                    <svg className="w-[13px] h-[13px] text-[#387DFF] stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Camera and mic active
                  </div>

                  <div className="flex gap-[10px] flex-wrap">
                    {!isThinking && (
                      <>
                        {isRecording ? (
                          <button
                            onClick={handleStopRecording}
                            className="bg-white text-[#1A1A1A] border-none rounded-full py-[10px] px-[20px] font-[600] text-[13px] cursor-pointer inline-flex items-center gap-[7px] shadow-[0_4px_14px_rgba(255,255,255,0.15)]"
                          >
                            <svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="6" width="12" height="12" rx="1.5" />
                            </svg>
                            Stop recording
                          </button>
                        ) : isRecordingStopped ? (
                          <>
                            {(!ENABLE_STAGE3_RETAKE_LIMIT || takesCount < 2) && (
                              <button
                                onClick={handleRetake}
                                className="bg-transparent text-white border border-white/20 rounded-full py-[9px] px-[16px] font-[600] text-[13px] cursor-pointer inline-flex items-center gap-[6px] hover:bg-white/10 transition-colors"
                              >
                                <svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <polyline points="23 4 23 10 17 10" />
                                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                </svg>
                                {ENABLE_STAGE3_RETAKE_LIMIT ? 'Retake (1 left)' : 'Retake'}
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={handleStartRecording}
                            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white border-none rounded-full py-[10px] px-[20px] font-[600] text-[13px] cursor-pointer inline-flex items-center gap-[7px] shadow-[0_4px_14px_rgba(220,38,38,0.25)] transition-colors"
                          >
                            <div className="w-[10px] h-[10px] rounded-full bg-white inline-block" />
                            Record
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Upload panel ── */}
            {activeTab === 'upload' && (
              <div className="bg-white border border-[#E6E6E6] rounded-[12px] p-[24px] min-h-[420px] flex flex-col items-stretch">
                {uploadedUrl ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="bg-[#0B0F14] rounded-[10px] h-[240px] flex items-center justify-center relative overflow-hidden mb-[14px]">
                      <video
                        src={uploadedUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-[10px] left-[10px] right-[10px] flex justify-between items-center z-[2]">
                        <div className="text-white text-[11px] font-[600] bg-black/55 backdrop-blur-[6px] p-[4px_10px] rounded-[6px] max-w-[60%] truncate">
                          {uploadedFile?.name}
                        </div>
                      </div>
                    </div>

                    <div className="p-[14px_16px] bg-[#EBF6FF] border border-[#387DFF]/20 rounded-[10px] flex items-center gap-[10px]">
                      <CheckIcon className="w-[16px] h-[16px] text-[#0047CC] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-[600] text-[#1A1A1A] mb-[2px]">Uploaded · within limits</div>
                        <div className="text-[11.5px] text-[#0047CC] font-[500]">
                          {uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(1) : 0} MB · Ready to submit
                        </div>
                      </div>
                      <button
                        onClick={handleReplaceUpload}
                        className="bg-white border border-[#E6E6E6] text-[#4A4A4A] p-[6px_12px] rounded-[8px] font-[600] text-[12px] cursor-pointer inline-flex items-center gap-[5px] shrink-0 hover:bg-[#F7F7F7] transition-colors"
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
                    className={`flex-1 border-[1.5px] border-dashed rounded-[12px] flex flex-col items-center justify-center p-[40px_28px] text-center cursor-pointer transition-all ${isDragging
                      ? 'border-[#0047CC] bg-[#F4F8FF]'
                      : 'border-[#D4D4D4] bg-[#FAFAFA] hover:border-[#808080] hover:bg-[#F5F5F5]'
                      }`}
                  >
                    <input
                      type="file"
                      id="file-upload-input"
                      accept=".mp4,.mov,.webm"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    <div className="w-[72px] h-[72px] rounded-[16px] bg-white border border-[#E6E6E6] flex items-center justify-center text-[#808080] mb-[14px]">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div className="text-[16px] font-[700] text-[#1A1A1A] mb-[6px]">
                      Drop a video here
                    </div>
                    <div className="text-[13px] text-[#808080] leading-[1.55] mb-[16px] max-w-[320px] font-[400]">
                      Or pick from your device. MP4, MOV, or WebM up to 50 mb.
                    </div>
                    <label
                      htmlFor="file-upload-input"
                      className="bg-[#0047CC] text-white border-none rounded-[10px] p-[10px_20px] font-[600] text-[13px] cursor-pointer inline-flex items-center gap-[7px] shadow-[0_2px_8px_rgba(0,71,204,0.2)] hover:bg-[#344DA1] transition-colors"
                    >
                      Choose video file
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right companion panel — single unified card ── */}
          <aside className="lg:sticky lg:top-[68px]">
            <div className="bg-white border border-[#E6E6E6] rounded-[12px] overflow-hidden">

              {/* Timer / status notice — always visible */}
              <div className="p-[18px_20px] flex items-start gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-full border-[2.5px] border-[#E6E6E6] border-t-[#0047CC] flex items-center justify-center shrink-0 animate-spin-slow">
                  <ClockPlayIcon className="w-[14px] h-[14px] text-[#0047CC] animate-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-[600] text-[#1A1A1A] mb-[3px]">
                    {isThinking ? 'Think time active' : 'Answer time running'}
                  </div>
                  <div className="text-[12.5px] text-[#808080] leading-[1.5] font-[400]">
                    {isThinking
                      ? 'Structure your thoughts. Recording starts when the timer ends.'
                      : "Speak naturally. A pause or \"let me think\" won't count against you."}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#E6E6E6]" />

              {/* Tips section — collapsible */}
              <div className="p-[14px_20px]">
                <button
                  onClick={() => setShowTips(prev => !prev)}
                  className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none text-left p-0"
                >
                  <span className="text-[12px] font-[600] text-[#808080] uppercase tracking-[0.5px]">Tips for a strong answer</span>
                  <svg
                    className={`w-[14px] h-[14px] text-[#ADADAD] transition-transform duration-200 ${showTips ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showTips && (
                  <ul className="list-none flex flex-col gap-[8px] mt-[12px] p-0 m-0">
                    <li className="text-[12.5px] text-[#666] font-[400] pl-[16px] relative leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#D4D4D4]">
                      Set the scene: where, when, what the problem was
                    </li>
                    <li className="text-[12.5px] text-[#666] font-[400] pl-[16px] relative leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#D4D4D4]">
                      Name the challenges in plain, structured language
                    </li>
                    <li className="text-[12.5px] text-[#666] font-[400] pl-[16px] relative leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#D4D4D4]">
                      Walk through what you did, including key decisions
                    </li>
                    <li className="text-[12.5px] text-[#666] font-[400] pl-[16px] relative leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#D4D4D4]">
                      End with the outcome and what you learned
                    </li>
                  </ul>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#E6E6E6]" />

              {/* Reassurance — always visible, calm */}
              <div className="p-[14px_20px]">
                <p className="text-[12.5px] text-[#808080] leading-[1.55] font-[400] italic m-0">
                  We're not grading polish — substance and structured thinking matter most.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="sticky bottom-0 bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[12px_28px] flex items-center justify-between gap-[12px] z-[40]">
        <div className="text-[12.5px] text-[#4A4A4A] font-[500] flex items-center gap-[10px]">
          {hasAnswer ? (
            <span className="inline-flex items-center gap-[6px] bg-[#EBF6FF] text-[#0047CC] border border-[#387DFF]/20 px-[12px] py-[5px] rounded-full text-[11.5px] font-[600]">
              <CheckIcon className="w-[11px] h-[11px]" />
              {activeTab === 'live' ? 'Recording captured' : 'Video uploaded'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-[6px] bg-[#F7F7F7] text-[#808080] px-[12px] py-[5px] rounded-full text-[11.5px] font-[500]">
              No answer yet
            </span>
          )}
          <span className="text-[#ADADAD] text-[11.5px] font-[500]">
            Question {currentNum} of {totalNum}
          </span>
        </div>

        <div className="flex gap-[10px]">
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={isSubmittingVideo}
            className="bg-white text-[#4A4A4A] border border-[#E6E6E6] rounded-[10px] p-[10px_16px] text-[13px] font-[600] cursor-pointer hover:bg-[#F7F7F7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save and finish later
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={!hasAnswer || isSubmittingVideo}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[10px_22px] text-[13.5px] font-[600] cursor-pointer inline-flex items-center gap-[7px] shadow-[0_2px_8px_rgba(0,71,204,0.2)] disabled:bg-[#E6E6E6] disabled:text-[#ADADAD] disabled:cursor-not-allowed disabled:shadow-none hover:bg-[#344DA1] transition-all"
          >
            {isSubmittingVideo ? (
              <>
                <div className="w-[14px] h-[14px] rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                Uploading…
              </>
            ) : (
              <>
                Submit answer
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
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
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
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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
                <polyline points="20 6 9 17 4 12" />
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
              Please keep this tab open...
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoleAssessmentStageThreeVideo;
