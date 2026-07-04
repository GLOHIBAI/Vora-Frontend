import React from 'react';
import type { AssessmentItemRendererProps } from '../shared/types';
import { getLikertQuestions } from '../../../../utils/assessmentItems';

const DEFAULT_LABELS = [
  'Strongly\ndisagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly\nagree',
];

const LikertItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  isAnswerLocked,
  onChange,
}) => {
  const rowLocked = (subKey?: string) =>
    disabled || (isAnswerLocked ? isAnswerLocked(subKey) : false);
  const statements = getLikertQuestions(item);
  const answerMap =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, number>)
      : {};

  return (
    <div className="space-y-[18px]">
      {statements.map((statement, idx) => {
        const labels = statement.scaleLabels?.length ? statement.scaleLabels : DEFAULT_LABELS;
        const answer = answerMap[statement.id];
        const hasAnswer = answer !== undefined;
        const statementNum = String(idx + 1).padStart(2, '0');

        const sectionBreak = (item.content.sectionBreaks as any[])?.find(
          (sb: any) => sb.afterQuestionIndex === idx - 1
        );

        return (
          <React.Fragment key={statement.id}>
            {sectionBreak && (
              <>
                <hr className="divider" />
                <span className="div-label">{sectionBreak.label}</span>
              </>
            )}
            <div className={`q-block ${hasAnswer ? 'answered' : ''}`}>
              <div className="q-num">Statement {statementNum}</div>
              <div className="q-text">{statement.text}</div>
              <div className="likert">
                {labels.map((label, rating) => {
                  const selected = answer === rating + 1;
                  const formattedLabel = label.split('\n').map((line, lIdx) => (
                    <span key={lIdx}>
                      {line}
                      {lIdx < label.split('\n').length - 1 && <br />}
                    </span>
                  ));
                  return (
                    <button
                      key={`${statement.id}-${label}`}
                      type="button"
                      disabled={rowLocked(statement.id)}
                      onClick={() => onChange(rating + 1, statement.id)}
                      className={`lk ${selected ? 'selected' : ''}`}
                    >
                      <div className="lk-dot"></div>
                      <div className="lk-l">{formattedLabel}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default LikertItem;
