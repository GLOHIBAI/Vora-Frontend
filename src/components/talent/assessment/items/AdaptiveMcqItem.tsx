import { useEffect, useRef, useState } from 'react';
import OptionButton from '../shared/OptionButton';
import type { AssessmentItemRendererProps } from '../shared/types';
import type { AdaptiveMcqPriorStep } from '../../../../services/queries/assessments/types';
import { DataDisplayBlock } from '../shared/DataDisplayBlock';

const AdaptiveMcqItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
  isAdaptiveLoading = false,
}) => {
  const content = item.content as any;
  const priorSteps = (content.priorSteps as AdaptiveMcqPriorStep[]) ?? [];

  const shimmerRef = useRef<HTMLDivElement | null>(null);
  /**
   * After shimmer ends, briefly disable follow-up options so a leftover click
   * cannot fire a second /adaptive. Strict Mode re-runs this effect and will
   * re-schedule the unlock — do not gate unlock on a one-shot ref.
   */
  const [optionsLocked, setOptionsLocked] = useState(false);

  useEffect(() => {
    if (isAdaptiveLoading) {
      setOptionsLocked(true);
      const scrollTimer = window.setTimeout(() => {
        shimmerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      return () => window.clearTimeout(scrollTimer);
    }

    // Idle: unlock after a short delay (re-scheduled safely under Strict Mode).
    const unlockTimer = window.setTimeout(() => {
      setOptionsLocked(false);
    }, 700);
    return () => window.clearTimeout(unlockTimer);
  }, [isAdaptiveLoading]);

  const optionsDisabled = disabled || isAdaptiveLoading || optionsLocked;

  const handleSelect = (optionId: string) => {
    if (optionsDisabled) return;
    onChange(optionId);
  };

  const isFollowUpLabel = (label?: string, stepIdx?: number) =>
    label === 'follow_up' || (typeof stepIdx === 'number' && stepIdx > 0);

  return (
    <div className="space-y-8">
      {/* 1. Prior Steps (Answered / Read-only) — stay visible while follow-up loads */}
      {priorSteps.map((step, stepIdx) => {
        const stepContent = step.content as any;
        const priorScenario = stepContent.scenario ?? stepContent.stem ?? '';
        const priorPrompt = stepContent.prompt ?? '';
        const priorInstruction = stepContent.instruction ?? '';
        const priorOptions = stepContent.options ?? [];
        const followUp = isFollowUpLabel(stepContent.scenarioLabel, stepIdx);

        return (
          <div key={step.step} className="space-y-4">
            {priorScenario && (
              <div className="bg-white border border-[#E6E6E6] rounded-2xl p-6 shadow-sm">
                <span className="text-[10.5px] font-[800] tracking-[0.8px] text-[#808080] uppercase block mb-3">
                  {followUp ? 'FOLLOW-UP SCENARIO' : 'SCENARIO'}
                </span>
                <p className="text-[14.5px] text-[#2D2D2D] leading-[1.65] whitespace-pre-line">
                  {String(priorScenario)}
                </p>
              </div>
            )}

            <DataDisplayBlock table={stepContent.table} chart={stepContent.chart} dataset={stepContent.dataset} />

            {priorPrompt && (
              <div className="mt-4">
                <h3 className="text-[15.5px] font-[800] text-[#1A1A1A] leading-snug">
                  {String(priorPrompt)}
                </h3>
                {priorInstruction && (
                  <p className="text-[12.5px] text-[#808080] mt-1">
                    {String(priorInstruction)}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2.5 mt-3">
              {priorOptions.map((opt: any, optIdx: number) => (
                <OptionButton
                  key={opt.id}
                  index={optIdx}
                  label={opt.label ?? opt.text ?? ''}
                  selected={step.optionId === opt.id}
                  disabled={true}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* 2. Active step — hidden while loading so only prior + follow-up shimmer show */}
      {content.complete || isAdaptiveLoading ? null : (
        <div className="space-y-6">
          {content.layout === 'multi_question' && content.sharedContext && (
            <div className="space-y-6">
              {content.sharedContext.kind === 'passage' && (
                <div className="bg-white border border-[#E6E6E6] rounded-2xl p-6 shadow-sm space-y-4">
                  {content.sharedContext.title && (
                    <h2 className="text-[17px] font-[900] text-[#1A1A1A] tracking-tight leading-snug">
                      {content.sharedContext.title}
                    </h2>
                  )}
                  <div className="space-y-3.5 text-[14px] text-[#2D2D2D] leading-[1.65] text-left">
                    {Array.isArray(content.sharedContext.paragraphs) &&
                      content.sharedContext.paragraphs.map((p: string, idx: number) => (
                        <p key={idx} className="whitespace-pre-line">
                          {p}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              <DataDisplayBlock
                table={content.sharedContext.table}
                chart={content.sharedContext.chart}
                dataset={content.sharedContext.dataset}
              />
            </div>
          )}

          {content.layout === 'multi_question' && Array.isArray(content.questions) ? (
            <div className="space-y-6">
              {content.questions.map((q: any, qIdx: number) => {
                const qValue = (value as Record<string, string> | undefined)?.[q.id];
                return (
                  <div key={q.id} className="bg-white border border-[#E6E6E6] rounded-2xl p-6 shadow-sm space-y-4">
                    <span className="text-[10.5px] font-[800] tracking-[0.8px] text-[#0047CC] uppercase block">
                      Question {qIdx + 1} of {content.questions.length}
                    </span>
                    {q.scenario && (
                      <div className="bg-[#F9FAFB] border border-[#E6E6E6] rounded-xl p-4">
                        <p className="text-[14.5px] text-[#2D2D2D] text-center font-semibold whitespace-pre-line leading-relaxed">
                          {String(q.scenario)}
                        </p>
                      </div>
                    )}
                    <h3 className="text-[15.5px] font-[800] text-[#1A1A1A] leading-snug">
                      {String(q.prompt)}
                    </h3>
                    {q.instruction && (
                      <p className="text-[12.5px] text-[#808080] mt-1">
                        {String(q.instruction)}
                      </p>
                    )}
                    <div className="space-y-2.5 mt-3">
                      {(q.options ?? []).map((opt: any, optIdx: number) => (
                        <OptionButton
                          key={opt.id}
                          index={optIdx}
                          label={opt.label ?? opt.text ?? ''}
                          selected={qValue === opt.id}
                          disabled={optionsDisabled}
                          onClick={() => {
                            if (optionsDisabled) return;
                            onChange(opt.id, q.id);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`space-y-4 ${optionsLocked ? 'pointer-events-none' : ''}`}>
              {(content.scenario || content.stem) && (
                <div className="bg-white border border-[#E6E6E6] rounded-2xl p-6 shadow-sm">
                  <span className="text-[10.5px] font-[800] tracking-[0.8px] text-[#808080] uppercase block mb-3">
                    {isFollowUpLabel(content.scenarioLabel) || priorSteps.length > 0
                      ? 'FOLLOW-UP SCENARIO'
                      : 'SCENARIO'}
                  </span>
                  <p className="text-[14.5px] text-[#2D2D2D] leading-[1.65] whitespace-pre-line">
                    {String(content.scenario ?? content.stem ?? '')}
                  </p>
                </div>
              )}

              <DataDisplayBlock table={content.table} chart={content.chart} dataset={content.dataset} />

              {content.prompt && (
                <div className="mt-4">
                  <h3 className="text-[15.5px] font-[800] text-[#1A1A1A] leading-snug">
                    {String(content.prompt)}
                  </h3>
                  {content.instruction && (
                    <p className="text-[12.5px] text-[#808080] mt-1">
                      {String(content.instruction)}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2.5 mt-3">
                {(content.options ?? []).map((opt: any, optIdx: number) => (
                  <OptionButton
                    key={opt.id}
                    index={optIdx}
                    label={opt.label ?? opt.text ?? ''}
                    selected={value === opt.id}
                    disabled={optionsDisabled}
                    onClick={() => handleSelect(opt.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Follow-up shimmer under the answered scenario */}
      {isAdaptiveLoading && (
        <div ref={shimmerRef} className="space-y-4 mt-2">
          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .shimmer-bg {
              background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite linear;
            }
          `}</style>
          <span className="text-[10.5px] font-[800] tracking-[0.8px] text-[#808080] uppercase block">
            Follow-up scenario
          </span>
          <div className="bg-white border border-[#E6E6E6] rounded-2xl p-6 shadow-sm">
            <div className="h-3 shimmer-bg rounded w-1/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 shimmer-bg rounded w-full"></div>
              <div className="h-4 shimmer-bg rounded w-5/6"></div>
              <div className="h-4 shimmer-bg rounded w-2/3"></div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-5 shimmer-bg rounded w-1/3"></div>
            <div className="h-3 shimmer-bg rounded w-1/4"></div>
          </div>

          <div className="space-y-2.5 mt-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full px-5 py-4 rounded-xl border border-[#E6E6E6] bg-white flex items-center gap-4"
              >
                <div className="w-[18px] h-[18px] shimmer-bg rounded-full shrink-0"></div>
                <div className="h-4 shimmer-bg rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveMcqItem;
