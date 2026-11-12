import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  TrashIcon,
  EditIcon,
  PlusIcon,
  BookOpenIcon,
  CloseIcon,
  FileIcon,
  LockIcon,
} from '../common/Icons';
import Spinner from '../common/Spinner';
import {
  useModuleAssessmentDraftQuery,
  useGenerateModuleAssessmentDraftMutation,
  useSaveModuleAssessmentMutation,
  usePublishModuleAssessmentMutation,
  useDeleteModuleAssessmentMutation,
} from '../../services/queries/courses/builder';
import type {
  BuilderLesson,
  ModuleAssessmentDraftData,
  AssessmentDraftChallenge,
} from '../../types/courseBuilder';

interface ModuleAssessmentManagerProps {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  lessons: BuilderLesson[];
}

export const ModuleAssessmentManager: React.FC<ModuleAssessmentManagerProps> = ({
  courseId,
  moduleId,
  moduleTitle,
  lessons,
}) => {
  const isTemp = !moduleId || moduleId.startsWith('temp-') || !courseId || courseId.startsWith('temp-');

  const {
    data: draft,
    isLoading,
  } = useModuleAssessmentDraftQuery(courseId, moduleId, {
    enabled: !isTemp,
  });

  const generateMutation = useGenerateModuleAssessmentDraftMutation();
  const saveMutation = useSaveModuleAssessmentMutation();
  const publishMutation = usePublishModuleAssessmentMutation();
  const deleteMutation = useDeleteModuleAssessmentMutation();

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Generate options
  const [challengeCount, setChallengeCount] = useState<number>(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(20);
  const [isUntimed, setIsUntimed] = useState<boolean>(false);

  // Review & Edit working draft
  const [workingDraft, setWorkingDraft] = useState<ModuleAssessmentDraftData | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Sync workingDraft when review modal opens or draft updates
  useEffect(() => {
    if (draft && isReviewModalOpen) {
      setWorkingDraft(JSON.parse(JSON.stringify(draft)));
      setFieldErrors({});
      setAttemptedSubmit(false);
    }
  }, [draft, isReviewModalOpen]);

  // Validation function
  const validateForm = (data: ModuleAssessmentDraftData, isPublish = false) => {
    const errors: Record<string, string> = {};

    if (!data.title?.trim()) {
      errors.title = 'Assessment title is required.';
    }

    if (data.passingScore < 50 || data.passingScore > 100) {
      errors.passingScore = 'Passing score must be between 50% and 100%.';
    }

    // Strictly enforce max 3 attempts
    if (!data.maxAttempts || data.maxAttempts > 3 || data.maxAttempts < 1) {
      errors.maxAttempts = 'Learners can have at most 3 attempts (policy maximum).';
    }

    if (data.cooldownHours < 1 || data.cooldownHours > 48) {
      errors.cooldownHours = 'Cooldown must be between 1 and 48 hours.';
    }

    if (data.timeLimitMinutes != null && data.timeLimitMinutes <= 0) {
      errors.timeLimitMinutes = 'Time limit must be at least 1 minute (or leave untimed).';
    }

    if (!data.challenges || data.challenges.length === 0) {
      errors.challenges = 'At least 1 scenario challenge is required.';
    } else {
      data.challenges.forEach((c, idx) => {
        if (!c.prompt?.trim()) {
          errors[`challenge_${idx}_prompt`] = `Question ${idx + 1} prompt is required.`;
        }

        if (!c.options || c.options.length < 2) {
          errors[`challenge_${idx}_options`] = `Question ${idx + 1} must have at least 2 options.`;
        } else {
          c.options.forEach((opt) => {
            if (!opt.text?.trim()) {
              errors[`challenge_${idx}_opt_${opt.id}`] = `Option ${opt.id} cannot be empty.`;
            }
          });
        }

        if (!c.correctOptionId || !c.options.some((o) => o.id === c.correctOptionId)) {
          errors[`challenge_${idx}_correct`] = `Please designate the correct answer for Question ${idx + 1}.`;
        }

        // When publishing, explanation is required so learners receive a clear debrief
        if (isPublish && !c.explanation?.trim()) {
          errors[`challenge_${idx}_explanation`] = `Please provide an explanation for Question ${idx + 1}.`;
        }
      });
    }

    return errors;
  };

  if (isTemp) {
    return (
      <div className="mt-3 p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
        Save module to enable practical assessment authoring & AI generation
      </div>
    );
  }

  const isPending = draft?.draftStatus === 'PENDING';
  const isFailed = draft?.draftStatus === 'FAILED';
  const isPublished = draft?.status === 'PUBLISHED';
  const hasAssessment = Boolean(draft && (draft.challenges?.length || draft.draftStatus));

  // Handle Generate with AI
  const handleGenerate = async () => {
    if (lessons.length === 0) {
      toast.error('Add at least one lesson before generating an assessment.');
      return;
    }

    try {
      await generateMutation.mutateAsync({
        courseId,
        moduleId,
        payload: {
          challengeCount,
          timeLimitMinutes: isUntimed ? undefined : timeLimitMinutes,
        },
      });
      setIsGenerateModalOpen(false);
      toast.success('AI drafting initiated. Analyzing lesson content and transcripts…');
    } catch (err: any) {
      const msg = err?.message || 'Failed to start AI assessment drafting.';
      toast.error(msg);
    }
  };

  // Handle Save Edited Draft
  const handleSaveDraft = async () => {
    if (!workingDraft) return;
    setAttemptedSubmit(true);

    const errors = validateForm(workingDraft, false);
    setFieldErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      toast.error(errors[errorKeys[0]]);
      return;
    }

    try {
      await saveMutation.mutateAsync({
        courseId,
        moduleId,
        payload: {
          title: workingDraft.title,
          description: workingDraft.description || undefined,
          scenarioContext: workingDraft.scenarioContext || undefined,
          practicalType: workingDraft.practicalType || undefined,
          passingScore: workingDraft.passingScore || 80,
          maxAttempts: Math.min(3, Math.max(1, workingDraft.maxAttempts || 3)),
          cooldownHours: workingDraft.cooldownHours || 12,
          timeLimitMinutes: workingDraft.timeLimitMinutes,
          challenges: workingDraft.challenges,
        },
      });
      toast.success('Assessment draft saved.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save assessment draft.');
    }
  };

  // Handle Publish
  const handlePublish = async () => {
    if (!workingDraft) return;
    setAttemptedSubmit(true);

    const errors = validateForm(workingDraft, true);
    setFieldErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      toast.error(errors[errorKeys[0]]);
      return;
    }

    try {
      await saveMutation.mutateAsync({
        courseId,
        moduleId,
        payload: {
          title: workingDraft.title,
          description: workingDraft.description || undefined,
          scenarioContext: workingDraft.scenarioContext || undefined,
          practicalType: workingDraft.practicalType || undefined,
          passingScore: workingDraft.passingScore || 80,
          maxAttempts: Math.min(3, Math.max(1, workingDraft.maxAttempts || 3)),
          cooldownHours: workingDraft.cooldownHours || 12,
          timeLimitMinutes: workingDraft.timeLimitMinutes,
          challenges: workingDraft.challenges,
        },
      });

      await publishMutation.mutateAsync({
        courseId,
        moduleId,
      });

      setIsReviewModalOpen(false);
      toast.success('Practical assessment published! Learners must achieve 80% to unlock subsequent modules.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish assessment.');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        courseId,
        moduleId,
      });
      setIsDeleteConfirmOpen(false);
      setIsReviewModalOpen(false);
      toast.success('Assessment removed.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete assessment.');
    }
  };

  return (
    <div className="mt-3">
      {/* ──────────────────────────────────────────────────────────────────
          STATE 1: AI DRAFTING IN PROGRESS (PENDING)
      ────────────────────────────────────────────────────────────────── */}
      {isPending && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0047CC] flex items-center justify-center shrink-0">
              <SparklesIcon size={16} className="text-white animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0047CC]">
                  AI is drafting module assessment…
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0047CC]">
                  <Spinner size={10} className="text-[#0047CC]" />
                  Transcribing & generating
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Analyzing lesson notes and audio transcripts to formulate practical multiple-choice scenario challenges with an 80% passing bar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          STATE 2: DRAFT FAILED
      ────────────────────────────────────────────────────────────────── */}
      {isFailed && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-amber-900">
                Assessment drafting could not complete
              </div>
              <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                {draft?.draftError ||
                  'Automatic drafting is not available right now. Please add plain-text notes to your lessons or write the questions manually.'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(true)}
                  className="px-3 py-1.5 bg-[#0047CC] hover:bg-[#003bb5] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Try AI Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWorkingDraft({
                      status: 'DRAFT',
                      draftStatus: 'READY',
                      title: `${moduleTitle} Practical Assessment`,
                      passingScore: 80,
                      maxAttempts: 3,
                      cooldownHours: 12,
                      timeLimitMinutes: 20,
                      challenges: [
                        {
                          id: 'c1',
                          prompt: 'Write your scenario challenge question here…',
                          options: [
                            { id: 'A', text: 'Option A' },
                            { id: 'B', text: 'Option B' },
                            { id: 'C', text: 'Option C' },
                            { id: 'D', text: 'Option D' },
                          ],
                          correctOptionId: 'A',
                          explanation: '',
                        },
                      ],
                    });
                    setFieldErrors({});
                    setAttemptedSubmit(false);
                    setIsReviewModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Write Manually
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2.5 py-1.5 text-rose-600 hover:text-rose-700 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          STATE 3: NO ASSESSMENT YET (OR STILL SILENTLY LOADING)
      ────────────────────────────────────────────────────────────────── */}
      {!hasAssessment && !isPending && !isFailed && (
        <div className="p-3.5 bg-gradient-to-r from-blue-50/50 via-slate-50 to-white border border-dashed border-blue-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-[#0047CC] mt-0.5">
              <SparklesIcon size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Module Practical Assessment
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-[#0047CC] rounded">
                  80% pass bar
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Gate module completion with practical workplace scenarios drafted from your lesson notes and videos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <SparklesIcon size={12} />
              <span>Draft with AI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWorkingDraft({
                  status: 'DRAFT',
                  draftStatus: 'READY',
                  title: `${moduleTitle} Practical Assessment`,
                  passingScore: 80,
                  maxAttempts: 3,
                  cooldownHours: 12,
                  timeLimitMinutes: 20,
                  challenges: [
                    {
                      id: 'c1',
                      prompt: '',
                      options: [
                        { id: 'A', text: '' },
                        { id: 'B', text: '' },
                        { id: 'C', text: '' },
                        { id: 'D', text: '' },
                      ],
                      correctOptionId: 'A',
                      explanation: '',
                    },
                  ],
                });
                setFieldErrors({});
                setAttemptedSubmit(false);
                setIsReviewModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <PlusIcon size={12} />
              <span>Manual</span>
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          STATE 4: DRAFT READY OR PUBLISHED
      ────────────────────────────────────────────────────────────────── */}
      {hasAssessment && !isPending && !isFailed && (
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isPublished
              ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
              : 'bg-amber-50/40 border-amber-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isPublished
                    ? 'bg-[#0047CC] text-white'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isPublished ? <CheckCircleIcon size={15} /> : <FileIcon size={15} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    {draft?.title || `${moduleTitle} Practical Assessment`}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPublished
                        ? 'bg-blue-100 text-[#0047CC]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isPublished ? 'Live for Learners' : 'Draft — In Review'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <BookOpenIcon size={12} className="text-slate-400" />
                    <strong>{draft?.challenges?.length || 0}</strong> Scenario Challenges
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon size={12} className="text-slate-400" />
                    Pass mark: <strong>{draft?.passingScore || 80}%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon size={12} className="text-slate-400" />
                    {draft?.timeLimitMinutes ? `${draft.timeLimitMinutes} mins` : 'Untimed'}
                  </span>
                  <span className="text-slate-400">
                    ({Math.min(3, draft?.maxAttempts || 3)} attempts max / {draft?.cooldownHours || 12}h cooldown)
                  </span>
                </div>

                {/* Warning if lessons were skipped */}
                {draft?.sources?.skippedLessons && draft.sources.skippedLessons.length > 0 && (
                  <div className="mt-2 text-[11px] text-amber-800 bg-amber-100/70 border border-amber-200/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                    <AlertTriangleIcon size={12} className="shrink-0 text-amber-600" />
                    <span>
                      Skipped {draft.sources.skippedLessons.length} lesson(s) without content ({draft.sources.skippedLessons.map((s) => s.title).join(', ')}). {draft.sources.skippedLessons[0]?.hint || 'Add notes to include them.'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const cloned: ModuleAssessmentDraftData = JSON.parse(JSON.stringify(draft));
                  // Ensure maxAttempts never exceeds 3
                  cloned.maxAttempts = Math.min(3, cloned.maxAttempts || 3);
                  setWorkingDraft(cloned);
                  setFieldErrors({});
                  setAttemptedSubmit(false);
                  setIsReviewModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <EditIcon size={12} />
                <span>Review & Edit</span>
              </button>

              {!isPublished && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await publishMutation.mutateAsync({
                        courseId,
                        moduleId,
                      });
                      toast.success('Practical assessment published! Learners will now complete this before advancing.');
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to publish assessment.');
                    }
                  }}
                  disabled={publishMutation.isPending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0047CC] hover:bg-[#003bb5] disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  {publishMutation.isPending ? (
                    <Spinner size={12} className="text-white" />
                  ) : (
                    <CheckCircleIcon size={12} />
                  )}
                  <span>Publish</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                title="Delete Assessment"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODAL: GENERATE WITH AI SETTINGS
      ────────────────────────────────────────────────────────────────── */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0047CC] flex items-center justify-center text-white">
                  <SparklesIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Draft Assessment with AI
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Module: {moduleTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <CloseIcon size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl text-xs text-blue-900 leading-relaxed">
                VORA AI reviews your lesson notes and lecture transcripts to author real-world workplace dilemmas. Questions test decision-making and practical application.
              </div>

              {/* Number of challenges */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Number of Scenario Challenges (3 – 10)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 8, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setChallengeCount(count)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        challengeCount === count
                          ? 'border-[#0047CC] bg-blue-50 text-[#0047CC]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              {/* Time limit */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Assessment Time Limit
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    disabled={isUntimed}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10) || 15)}
                    className="w-24 bg-white border border-slate-300 focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/15 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none disabled:opacity-40"
                  />
                  <span className="text-xs text-slate-600">Minutes</span>
                  <label className="ml-auto flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isUntimed}
                      onChange={(e) => setIsUntimed(e.target.checked)}
                      className="rounded border-slate-300 text-[#0047CC] focus:ring-[#0047CC]"
                    />
                    <span>Untimed</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 leading-normal">
                Pass mark is standard at <strong>80%</strong>. Learners receive <strong>3 attempts maximum</strong> followed by a <strong>12-hour cool-off</strong>.
              </div>
            </div>

            <div className="p-4 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {generateMutation.isPending ? (
                  <>
                    <Spinner size={14} className="text-white" />
                    <span>Initiating Draft…</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon size={14} />
                    <span>Generate Assessment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODAL: REVIEW & EDIT ASSESSMENT
      ────────────────────────────────────────────────────────────────── */}
      {isReviewModalOpen && workingDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Review Practical Assessment
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      workingDraft.status === 'PUBLISHED'
                        ? 'bg-blue-100 text-[#0047CC]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {workingDraft.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Module: {moduleTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <CloseIcon size={14} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {/* Top alert if validation failed */}
              {attemptedSubmit && Object.keys(fieldErrors).length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertTriangleIcon size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Please resolve the following issues before proceeding:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {Object.values(fieldErrors).slice(0, 3).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Sources Overview */}
              {workingDraft.sources && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Course Knowledge Sources
                  </div>
                  {workingDraft.sources.usedLessons && workingDraft.sources.usedLessons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {workingDraft.sources.usedLessons.map((ul, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-[#0047CC] border border-blue-200/60 rounded-lg text-[11px] font-medium"
                        >
                          <BookOpenIcon size={11} />
                          <span>{ul.title}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-blue-200/50 uppercase font-bold">
                            {ul.source}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {workingDraft.sources.skippedLessons && workingDraft.sources.skippedLessons.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-800">
                      <strong>Skipped Lessons:</strong>{' '}
                      {workingDraft.sources.skippedLessons.map((sl, idx) => (
                        <span key={idx} className="block mt-0.5">
                          • {sl.title}: {sl.hint}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Assessment Meta & Settings */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Assessment Title <span className="text-rose-500">*</span>
                    </label>
                    {fieldErrors.title && (
                      <span className="text-[11px] text-rose-600 font-semibold">{fieldErrors.title}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={workingDraft.title}
                    onChange={(e) => {
                      setWorkingDraft({ ...workingDraft, title: e.target.value });
                      if (fieldErrors.title) {
                        const copy = { ...fieldErrors };
                        delete copy.title;
                        setFieldErrors(copy);
                      }
                    }}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold outline-none transition-colors ${
                      fieldErrors.title
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-300 focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/15'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Passing Score */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Passing Score (%) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={workingDraft.passingScore}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const clamped = isNaN(val) ? 80 : Math.min(100, Math.max(50, val));
                        setWorkingDraft({
                          ...workingDraft,
                          passingScore: clamped,
                        });
                      }}
                      className="w-full bg-white border border-slate-300 focus:border-[#0047CC] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Min 50%, standard 80%</p>
                  </div>

                  {/* Time limit */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Time Limit (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Untimed"
                      value={workingDraft.timeLimitMinutes || ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : null;
                        setWorkingDraft({
                          ...workingDraft,
                          timeLimitMinutes: val && val > 0 ? val : null,
                        });
                      }}
                      className="w-full bg-white border border-slate-300 focus:border-[#0047CC] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Blank for untimed</p>
                  </div>

                  {/* Max Attempts (STRICTLY CAPPED AT 3) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Max Attempts <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-[#0047CC] bg-blue-50 px-1.5 py-0.5 rounded">
                        Max 3
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="3"
                      value={Math.min(3, Math.max(1, workingDraft.maxAttempts || 3))}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        // User can only have 3 max attempts; that 3 can NOT increase
                        const clamped = isNaN(parsed) ? 1 : Math.min(3, Math.max(1, parsed));
                        setWorkingDraft({
                          ...workingDraft,
                          maxAttempts: clamped,
                        });
                      }}
                      className="w-full bg-white border border-slate-300 focus:border-[#0047CC] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Fixed policy max: 3 attempts
                    </p>
                  </div>

                  {/* Cool-off hours */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Cool-off (hours) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="48"
                      value={workingDraft.cooldownHours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const clamped = isNaN(val) ? 12 : Math.min(48, Math.max(1, val));
                        setWorkingDraft({
                          ...workingDraft,
                          cooldownHours: clamped,
                        });
                      }}
                      className="w-full bg-white border border-slate-300 focus:border-[#0047CC] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Default 12 hours</p>
                  </div>
                </div>
              </div>

              {/* Challenges List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Scenario Challenges ({workingDraft.challenges.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `c${workingDraft.challenges.length + 1}`;
                      setWorkingDraft({
                        ...workingDraft,
                        challenges: [
                          ...workingDraft.challenges,
                          {
                            id: newId,
                            prompt: '',
                            options: [
                              { id: 'A', text: '' },
                              { id: 'B', text: '' },
                              { id: 'C', text: '' },
                              { id: 'D', text: '' },
                            ],
                            correctOptionId: 'A',
                            explanation: '',
                          },
                        ],
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0047CC] hover:text-[#003bb5] cursor-pointer"
                  >
                    <PlusIcon size={13} />
                    <span>Add Question</span>
                  </button>
                </div>

                {workingDraft.challenges.map((challenge, cIdx) => {
                  const promptError = fieldErrors[`challenge_${cIdx}_prompt`];
                  const optionsError = fieldErrors[`challenge_${cIdx}_options`];
                  const correctError = fieldErrors[`challenge_${cIdx}_correct`];
                  const explanationError = fieldErrors[`challenge_${cIdx}_explanation`];

                  return (
                    <div
                      key={challenge.id || cIdx}
                      className="p-5 bg-white border border-slate-200 rounded-xl space-y-3.5 shadow-2xs"
                    >
                      {/* Question Header & Prompt */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-[#0047CC] text-xs font-bold shrink-0">
                            {cIdx + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-800">
                              Question {cIdx + 1} Prompt <span className="text-rose-500">*</span>
                            </span>
                            {promptError && (
                              <span className="ml-2 text-[11px] text-rose-600 font-semibold">{promptError}</span>
                            )}
                          </div>
                          {workingDraft.challenges.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = workingDraft.challenges.filter((_, idx) => idx !== cIdx);
                                setWorkingDraft({ ...workingDraft, challenges: updated });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                              title="Delete question"
                            >
                              <TrashIcon size={14} />
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={3}
                          value={challenge.prompt}
                          onChange={(e) => {
                            const updated = [...workingDraft.challenges];
                            updated[cIdx] = { ...challenge, prompt: e.target.value };
                            setWorkingDraft({ ...workingDraft, challenges: updated });
                            if (promptError) {
                              const copy = { ...fieldErrors };
                              delete copy[`challenge_${cIdx}_prompt`];
                              setFieldErrors(copy);
                            }
                          }}
                          className={`w-full bg-white border rounded-xl p-2.5 text-xs text-slate-900 font-semibold outline-none leading-relaxed transition-colors ${
                            promptError
                              ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                              : 'border-slate-300 focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/15'
                          }`}
                          placeholder="Write the scenario problem and question…"
                        />
                      </div>

                      {/* Source citation if generated from AI */}
                      {challenge.sourceLessonTitle && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                          <div className="font-bold text-slate-700 flex items-center gap-1.5">
                            <BookOpenIcon size={11} className="text-[#0047CC]" />
                            <span>Based on lesson: {challenge.sourceLessonTitle}</span>
                          </div>
                          {challenge.sourceQuote && (
                            <div className="italic text-slate-500 pl-4 border-l-2 border-[#0047CC]">
                              &ldquo;{challenge.sourceQuote}&rdquo;
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options list */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-bold text-slate-700">
                            Options (select the radio button to designate the correct answer):
                          </div>
                          {optionsError && (
                            <span className="text-[11px] text-rose-600 font-semibold">{optionsError}</span>
                          )}
                          {correctError && (
                            <span className="text-[11px] text-rose-600 font-semibold">{correctError}</span>
                          )}
                        </div>

                        {challenge.options.map((opt, optIdx) => {
                          const isCorrect = challenge.correctOptionId === opt.id;
                          const optError = fieldErrors[`challenge_${cIdx}_opt_${opt.id}`];

                          return (
                            <div
                              key={opt.id || optIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                isCorrect
                                  ? 'border-[#0047CC] bg-blue-50/40'
                                  : optError
                                  ? 'border-rose-300 bg-rose-50/20'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${cIdx}`}
                                checked={isCorrect}
                                onChange={() => {
                                  const updated = [...workingDraft.challenges];
                                  const prevChallenge = challenge;
                                  let newExplanation = prevChallenge.explanation || '';

                                  // Dynamically update explanation if it was the default template or empty!
                                  if (
                                    !newExplanation ||
                                    newExplanation.match(/^Explain why Option [A-Z] is/i) ||
                                    newExplanation.match(/^Explain why this option is/i) ||
                                    newExplanation.match(/^Explain why the selected option is/i)
                                  ) {
                                    newExplanation = `Explain why Option ${opt.id} is the recommended industry approach…`;
                                  }

                                  updated[cIdx] = {
                                    ...challenge,
                                    correctOptionId: opt.id,
                                    explanation: newExplanation,
                                  };
                                  setWorkingDraft({ ...workingDraft, challenges: updated });
                                  if (correctError) {
                                    const copy = { ...fieldErrors };
                                    delete copy[`challenge_${cIdx}_correct`];
                                    setFieldErrors(copy);
                                  }
                                }}
                                className="text-[#0047CC] focus:ring-[#0047CC] cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-600 w-5 shrink-0">
                                {opt.id}.
                              </span>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const updatedOpts = [...challenge.options];
                                  updatedOpts[optIdx] = { ...opt, text: e.target.value };
                                  const updated = [...workingDraft.challenges];
                                  updated[cIdx] = { ...challenge, options: updatedOpts };
                                  setWorkingDraft({ ...workingDraft, challenges: updated });
                                  if (optError) {
                                    const copy = { ...fieldErrors };
                                    delete copy[`challenge_${cIdx}_opt_${opt.id}`];
                                    setFieldErrors(copy);
                                  }
                                }}
                                className="flex-1 bg-transparent border-none text-xs text-slate-900 font-medium outline-none"
                                placeholder={`Option ${opt.id} text…`}
                              />
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-[#0047CC] bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Dynamic Rationale & Explanation */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700">
                            Rationale & Explanation (explain why Option {challenge.correctOptionId || 'this option'} is correct)
                          </label>
                          {explanationError && (
                            <span className="text-[11px] text-rose-600 font-semibold">{explanationError}</span>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={challenge.explanation || ''}
                          onChange={(e) => {
                            const updated = [...workingDraft.challenges];
                            updated[cIdx] = { ...challenge, explanation: e.target.value };
                            setWorkingDraft({ ...workingDraft, challenges: updated });
                            if (explanationError) {
                              const copy = { ...fieldErrors };
                              delete copy[`challenge_${cIdx}_explanation`];
                              setFieldErrors(copy);
                            }
                          }}
                          placeholder={`Explain why Option ${challenge.correctOptionId || 'the selected option'} is the recommended industry approach and why the alternatives fall short…`}
                          className={`w-full bg-white border rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-colors ${
                            explanationError
                              ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                              : 'border-slate-200 focus:border-[#0047CC]'
                          }`}
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Shown to learners during debrief to explain why Option {challenge.correctOptionId || 'this option'} is the correct choice.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                >
                  {saveMutation.isPending ? 'Saving Draft…' : 'Save Draft'}
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishMutation.isPending || saveMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {publishMutation.isPending ? (
                    <>
                      <Spinner size={14} className="text-white" />
                      <span>Publishing…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={14} />
                      <span>Publish Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODAL: CONFIRM DELETE
      ────────────────────────────────────────────────────────────────── */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrashIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Delete Practical Assessment?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will remove the scenario assessment from this module. If published, learners will no longer be gated by this assessment to advance.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
