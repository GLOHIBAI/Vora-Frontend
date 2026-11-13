import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CloseIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon, 
  LockIcon, 
  ChevronRightIcon 
} from '../common/Icons';
import { 
  useModuleAssessmentQuery, 
  useSubmitModuleAssessmentMutation 
} from '../../services/queries/courses';
import type { 
  ModuleAssessmentSubmitResponse, 
  ModuleAssessmentSubmitAnswer 
} from '../../types/courses';
import { toast } from 'react-hot-toast';

interface ModuleAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  onPassed?: (nextModuleId?: string | null, isCourseCompleted?: boolean) => void;
}

export const ModuleAssessmentModal: React.FC<ModuleAssessmentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  moduleId,
  moduleTitle,
  onPassed,
}) => {
  const navigate = useNavigate();

  // Selected answers: challengeId -> optionId
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitResult, setSubmitResult] = useState<ModuleAssessmentSubmitResponse | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Assessment Query
  const {
    data: assessmentData,
    isLoading,
    error: fetchError,
    refetch,
  } = useModuleAssessmentQuery(courseId, moduleId, isOpen);

  // Submit Mutation
  const submitMutation = useSubmitModuleAssessmentMutation();

  // Countdown timer derived from server remainingSeconds
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedAnswers({});
      setSubmitResult(null);
      setRemainingSeconds(null);
      setShowExitConfirm(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (assessmentData?.session?.remainingSeconds != null) {
      setRemainingSeconds(assessmentData.session.remainingSeconds);
    }
  }, [isOpen, assessmentData]);

  // Live countdown
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0 || submitResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, submitResult]);

  const handleTimeExpired = async () => {
    if (submitResult || submitMutation.isPending) return;
    toast.error('Time expired! Submitting current answers...');
    await performSubmit(true);
  };

  const handleOptionSelect = (challengeId: string, optionId: string) => {
    if (submitResult || submitMutation.isPending) return;
    setSelectedAnswers((prev) => ({ ...prev, [challengeId]: optionId }));
  };

  const performSubmit = async (isTimeout = false) => {
    if (!assessmentData) return;

    const answers: ModuleAssessmentSubmitAnswer[] = assessmentData.challenges.map((c) => ({
      challengeId: c.id,
      selectedOptionId: selectedAnswers[c.id] || '',
    }));

    try {
      const res = await submitMutation.mutateAsync({
        courseId,
        moduleId,
        answers,
      });

      if (res) {
        setSubmitResult(res);
        if (res.passed) {
          toast.success(res.message || '🎉 Congratulations! You passed the practical assessment!');
          if (onPassed) {
            onPassed(res.nextModuleId, res.courseCompleted);
          }
        } else if (res.timedOut || isTimeout) {
          toast.error('Assessment timed out.');
        } else {
          toast.error(`Score: ${res.score}%. Passing score is ${res.passingScore}%.`);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit practical assessment');
    }
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentData) return;
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalCount = assessmentData.challenges.length;

    if (answeredCount < totalCount) {
      toast.error(`Please answer all ${totalCount} challenges before submitting.`);
      return;
    }

    performSubmit(false);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitResult(null);
    refetch();
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Sticky Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0 space-y-0.5">
            <span className="text-[11px] font-bold text-[#0052CC] uppercase tracking-wider">
              {moduleTitle} • Practical Assessment
            </span>
            <h2 className="text-[17px] font-bold text-slate-900 truncate">
              {assessmentData?.title || 'Scenario-Based Assessment'}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Timer if applicable and not submitted */}
            {!submitResult && remainingSeconds !== null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  remainingSeconds < 120
                    ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                    : 'bg-blue-50 text-[#0052CC] border-blue-200'
                }`}
              >
                <span>⏱</span>
                <span>{formatTimer(remainingSeconds)}</span>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                if (!submitResult && remainingSeconds !== null && remainingSeconds > 0) {
                  setShowExitConfirm(true);
                } else {
                  onClose();
                }
              }}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Exit confirmation modal overlay */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangleIcon size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Exit Assessment?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your countdown timer will continue running in the background. If the timer expires, this attempt will count as failed.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full"
                >
                  Continue Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full"
                >
                  Leave Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body: Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Loading state */}
          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">
                Opening practical scenario assessment...
              </p>
            </div>
          )}

          {/* Fetch error / 403 Lock state / 404 Not published */}
          {!isLoading && fetchError && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0052CC] flex items-center justify-center mx-auto">
                <LockIcon size={24} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-base">
                  {(fetchError as any)?.status === 404 || (fetchError as any)?.statusCode === 404
                    ? 'No Assessment Available'
                    : 'Assessment Locked'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {(fetchError as any)?.status === 404 || (fetchError as any)?.statusCode === 404
                    ? 'This module does not currently have a published practical assessment.'
                    : (fetchError as any)?.message ||
                      'You must complete all lessons and pass previous module assessments before taking this practical scenario.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#0052CC] text-white rounded-full text-xs font-bold hover:bg-[#0047CC] transition-colors cursor-pointer"
              >
                Back to Syllabus
              </button>
            </div>
          )}

          {/* Active assessment question view */}
          {!isLoading && !fetchError && assessmentData && !submitResult && (
            <form onSubmit={handleSubmitClick} className="space-y-6">
              {/* Meta bar: Attempts & Pass Threshold */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Pass Mark:</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0052CC] font-bold">
                    {assessmentData.passingScore}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Attempts:</span>
                  <span className="font-semibold text-slate-600">
                    {(assessmentData.talentState?.attemptsUsed ?? assessmentData.attemptsUsed ?? 0) + 1} of {assessmentData.maxAttempts || 3}
                  </span>
                </div>
              </div>

              {/* Scenario Context Card */}
              {assessmentData.scenarioContext && (
                <div className="bg-gradient-to-br from-slate-900 to-[#0F1E36] text-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 text-blue-200 border border-white/20">
                      Scenario Brief
                    </span>
                    {assessmentData.practicalType && (
                      <span className="text-[10px] font-semibold text-slate-400 capitalize">
                        {assessmentData.practicalType.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  {typeof assessmentData.scenarioContext === 'string' ? (
                    <p className="text-[13px] leading-relaxed text-slate-200 font-normal whitespace-pre-line">
                      {assessmentData.scenarioContext}
                    </p>
                  ) : (
                    <div className="space-y-3 text-[13px] leading-relaxed text-slate-200">
                      {(assessmentData.scenarioContext as any).briefing && (
                        <p>{(assessmentData.scenarioContext as any).briefing}</p>
                      )}
                      {(assessmentData.scenarioContext as any).setting && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
                            Setting
                          </span>
                          <p className="text-slate-200">{(assessmentData.scenarioContext as any).setting}</p>
                        </div>
                      )}
                      {(assessmentData.scenarioContext as any).conflict && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
                            Conflict &amp; Challenge
                          </span>
                          <p className="text-slate-200">{(assessmentData.scenarioContext as any).conflict}</p>
                        </div>
                      )}
                      {!(assessmentData.scenarioContext as any).setting &&
                        !(assessmentData.scenarioContext as any).conflict &&
                        !(assessmentData.scenarioContext as any).briefing && (
                          <div className="space-y-2">
                            {Object.entries(assessmentData.scenarioContext).map(([key, val]) => (
                              <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                                </span>
                                <p className="text-slate-200">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Challenges (Questions) */}
              <div className="space-y-6">
                {assessmentData.challenges.map((challenge, cIdx) => {
                  const selected = selectedAnswers[challenge.id];
                  const questionText = challenge.prompt || challenge.question || challenge.scenarioPrompt || `Scenario Question ${cIdx + 1}`;

                  return (
                    <div
                      key={challenge.id}
                      className="border border-slate-200/90 rounded-2xl p-5 space-y-3.5 bg-white shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {cIdx + 1}
                        </span>
                        <div className="space-y-1 flex-1 min-w-0">
                          {challenge.competencyTag && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0052CC]">
                              {challenge.competencyTag}
                            </span>
                          )}
                          <h4 className="text-[14px] font-bold text-slate-900 leading-snug">
                            {questionText}
                          </h4>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pt-1 pl-8">
                        {challenge.options.map((option) => {
                          const isOptionSelected = selected === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleOptionSelect(challenge.id, option.id)}
                              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                                isOptionSelected
                                  ? 'border-[#0052CC] bg-blue-50/50 ring-1 ring-[#0052CC]/30'
                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isOptionSelected
                                    ? 'border-[#0052CC] bg-[#0052CC]'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isOptionSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <span
                                className={`text-[13px] leading-snug ${
                                  isOptionSelected
                                    ? 'font-bold text-slate-900'
                                    : 'font-normal text-slate-700'
                                }`}
                              >
                                {option.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-500">
                  {Object.keys(selectedAnswers).length} of {assessmentData.challenges.length} answered
                </span>

                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full sm:w-auto px-8 py-3 bg-[#0052CC] hover:bg-[#0047CC] disabled:opacity-50 text-white rounded-full font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-98"
                >
                  {submitMutation.isPending ? 'Submitting Answers...' : 'Submit Practical Assessment'}
                </button>
              </div>
            </form>
          )}

          {/* Results & Debrief Screen */}
          {!isLoading && submitResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score Banner */}
              <div
                className={`rounded-2xl p-6 text-center space-y-3 border ${
                  submitResult.passed
                    ? 'bg-blue-50/80 border-blue-200 text-[#0052CC]'
                    : 'bg-rose-50/80 border-rose-200 text-rose-800'
                }`}
              >
                <div className="text-3xl font-black">
                  {submitResult.score}%
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">
                    {submitResult.passed ? '🎉 Practical Assessment Passed!' : 'Assessment Not Passed'}
                  </h3>
                  <p className="text-xs opacity-90 max-w-md mx-auto">
                    {submitResult.passed
                      ? `Great work! You scored ${submitResult.score}%, exceeding the ${submitResult.passingScore}% pass mark.`
                      : `You scored ${submitResult.score}%. The pass mark is ${submitResult.passingScore}%. Review the debrief below to understand each scenario.`}
                  </p>
                </div>

                {/* Cooldown notice if 3 attempts failed */}
                {submitResult.cooldownUntil && (
                  <div className="bg-white/80 p-3 rounded-xl border border-rose-200 text-xs text-rose-900 font-medium max-w-md mx-auto">
                    3 attempts used. In restudy cool-off until{' '}
                    <strong className="font-bold">
                      {new Date(submitResult.cooldownUntil).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                    . Please review the module lessons before trying again.
                  </div>
                )}
              </div>

              {/* Action Buttons for Next Step */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {submitResult.passed ? (
                  submitResult.courseCompleted ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/onboarding/talent');
                      }}
                      className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Complete Full Talent Profile</span>
                      <ChevronRightIcon size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Continue to Next Module →
                    </button>
                  )
                ) : (
                  !submitResult.cooldownUntil &&
                  submitResult.attemptsRemainingInCycle > 0 && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Try Again ({submitResult.attemptsRemainingInCycle} attempts left)
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold cursor-pointer"
                >
                  Close & Review Syllabus
                </button>
              </div>

              {/* Question Debrief / Feedback list */}
              {submitResult.feedback && submitResult.feedback.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-[14px] font-bold text-slate-900">
                    Scenario Debrief & Key Learnings
                  </h4>

                  <div className="space-y-3">
                    {submitResult.feedback.map((item, idx) => (
                      <div
                        key={item.challengeId || idx}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          item.isCorrect
                            ? 'bg-blue-50/30 border-blue-200/80'
                            : 'bg-rose-50/30 border-rose-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">Challenge {idx + 1}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              item.isCorrect
                                ? 'bg-blue-100 text-[#0052CC]'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {item.isCorrect ? 'Correct Decision' : 'Suboptimal Decision'}
                          </span>
                        </div>

                        {item.competencyTag && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            Competency: <span className="font-semibold">{item.competencyTag}</span>
                          </div>
                        )}

                        {item.explanation && (
                          <p className="text-slate-700 leading-relaxed font-normal">
                            {item.explanation}
                          </p>
                        )}

                        {item.rationale && (
                          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 text-slate-600 text-[11px]">
                            <strong className="font-semibold text-slate-800">Rationale: </strong>
                            {item.rationale}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleAssessmentModal;

