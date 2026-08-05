import React from 'react';
import FormattedPromptText from './FormattedPromptText';

export interface AssessmentItemCardProps {
  item?: any;
  label?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const getItemQuestionLabel = (item?: any, explicitLabel?: string): string | undefined => {
  if (explicitLabel) return explicitLabel;
  if (!item) return undefined;

  const seq = item.sequence ?? item.numText ?? item.sessionScreenIndex;
  const total = item.total ?? item.stageSessionTotal ?? item.sessionScreenTotal;
  const titleText = item.title ? String(item.title) : undefined;

  if (seq !== undefined && seq !== null) {
    let questionPrefix = `QUESTION ${seq}`;
    if (total !== undefined && total !== null && total > 0) {
      questionPrefix += ` OF ${total}`;
    }
    if (titleText && titleText.toLowerCase() !== questionPrefix.toLowerCase()) {
      return `${questionPrefix} · ${titleText.toUpperCase()}`;
    }
    return questionPrefix;
  }

  if (titleText) {
    return titleText.toUpperCase();
  }

  return undefined;
};

const AssessmentItemCard: React.FC<AssessmentItemCardProps> = ({
  item,
  label,
  title,
  children,
  className = '',
}) => {
  const seq = item?.sequence ?? item?.numText ?? item?.sessionScreenIndex;
  const titleText = item?.title ? String(item.title) : undefined;
  const displayLabel = getItemQuestionLabel(item, label);

  return (
    <div className={`bg-white border border-[#E6E6E6] rounded-xl p-5 ${className}`}>
      {seq !== undefined && seq !== null ? (
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-[30px] h-[30px] rounded-full bg-white border border-[#E6E6E6] text-[#4A4A4A] flex items-center justify-center text-[13px] font-[800] shrink-0 shadow-sm">
            {seq}
          </div>
          {titleText && (
            <span className="text-[12px] font-[800] tracking-[0.5px] text-[#4A4A4A] uppercase">
              {titleText}
            </span>
          )}
        </div>
      ) : displayLabel ? (
        <p className="text-[11px] font-[800] tracking-[0.7px] text-[#0047CC] uppercase mb-2">
          {displayLabel}
        </p>
      ) : null}
      {title ? (
        <div className="text-base font-semibold text-[#1A1A1A] mb-4 leading-relaxed">
          <FormattedPromptText text={title} />
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default AssessmentItemCard;
