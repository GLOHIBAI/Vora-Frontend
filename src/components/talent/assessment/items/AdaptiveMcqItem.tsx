import OptionButton from '../shared/OptionButton';
import type { AssessmentItemRendererProps } from '../shared/types';
import type { AdaptiveMcqPriorStep } from '../../../../services/queries/assessments/types';
import { DataDisplayBlock } from '../shared/DataDisplayBlock';

const AdaptiveMcqItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const content = item.content as any;
  const priorSteps = (content.priorSteps as AdaptiveMcqPriorStep[]) ?? [];

  return (
    <div className="space-y-8">
      {/* 1. Prior Steps (Answered / Read-only) */}
      {priorSteps.map((step, stepIdx) => {
        const stepContent = step.content as any;
        const priorScenario = stepContent.scenario ?? stepContent.stem ?? '';
        const priorPrompt = stepContent.prompt ?? '';
        const priorInstruction = stepContent.instruction ?? '';
        const priorOptions = stepContent.options ?? [];
        const isFollowUp = stepIdx > 0;

        return (
          <div key={step.step} className="space-y-4">
            {/* Scenario Card */}
            {priorScenario && (
              <div className="bg-white border border-[#E6E6E6] rounded-2xl p-6 shadow-sm">
                <span className="text-[10.5px] font-[800] tracking-[0.8px] text-[#808080] uppercase block mb-3">
                  {isFollowUp ? 'FOLLOW-UP SCENARIO' : 'SCENARIO'}
                </span>
                <p className="text-[14.5px] text-[#2D2D2D] leading-[1.65] whitespace-pre-line">
                  {String(priorScenario)}
                </p>
              </div>
            )}

            <DataDisplayBlock table={stepContent.table} chart={stepContent.chart} />

            {/* Prompt & Instruction */}
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

            {/* Options */}
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

      {/* 2. Active Step (only render if complete is not true) */}
      {content.complete ? null : (
        <div className="space-y-6">
          {content.layout === 'multi_question' && content.sharedContext && (
            <DataDisplayBlock
              table={content.sharedContext.table}
              chart={content.sharedContext.chart}
            />
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
                          disabled={disabled}
                          onClick={() => onChange(opt.id, q.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Scenario Card */}
              {(content.scenario || content.stem) && (
                <div className="bg-white border border-[#E6E6E6] rounded-2xl p-6 shadow-sm">
                  <span className="text-[10.5px] font-[800] tracking-[0.8px] text-[#808080] uppercase block mb-3">
                    {priorSteps.length > 0 ? 'FOLLOW-UP SCENARIO' : 'SCENARIO'}
                  </span>
                  <p className="text-[14.5px] text-[#2D2D2D] leading-[1.65] whitespace-pre-line">
                    {String(content.scenario ?? content.stem ?? '')}
                  </p>
                </div>
              )}

              <DataDisplayBlock table={content.table} chart={content.chart} />

              {/* Active Prompt & Instruction */}
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

              {/* Active Options */}
              <div className="space-y-2.5 mt-3">
                {(content.options ?? []).map((opt: any, optIdx: number) => (
                  <OptionButton
                    key={opt.id}
                    index={optIdx}
                    label={opt.label ?? opt.text ?? ''}
                    selected={value === opt.id}
                    disabled={disabled}
                    onClick={() => onChange(opt.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdaptiveMcqItem;
