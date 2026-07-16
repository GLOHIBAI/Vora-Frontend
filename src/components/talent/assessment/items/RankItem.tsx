import { useState, useRef, useCallback } from 'react';
import type { AssessmentItemRendererProps } from '../shared/types';
import type { RankAnswerValue } from '../../../../services/queries/assessments/types';
import { getRankOptionIds } from '../../../../utils/assessmentItems';

const GripIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <circle cx="9" cy="6" r="1.5"/>
    <circle cx="9" cy="12" r="1.5"/>
    <circle cx="9" cy="18" r="1.5"/>
    <circle cx="15" cy="6" r="1.5"/>
    <circle cx="15" cy="12" r="1.5"/>
    <circle cx="15" cy="18" r="1.5"/>
  </svg>
);

const RankItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const options = item.content.options ?? item.content.values ?? [];
  const defaultOrder = getRankOptionIds(item);
  const ranked = (Array.isArray(value) && value.length > 0 ? value : defaultOrder) as RankAnswerValue;

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const move = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= ranked.length) return;
      const next = [...ranked];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next);
    },
    [ranked, onChange],
  );

  const handleDragStart = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      if (disabled) return;
      setDragIdx(idx);
      e.dataTransfer.effectAllowed = 'move';
      const el = e.currentTarget as HTMLElement;
      // Make the dragged element semi-transparent
      requestAnimationFrame(() => {
        if (el) {
          el.style.opacity = '0.5';
        }
      });
    },
    [disabled],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      setDragIdx(null);
      (e.currentTarget as HTMLElement).style.opacity = '1';
    },
    [],
  );

  const handleDragOver = useCallback(
    (targetIdx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      e.dataTransfer.dropEffect = 'move';
      if (dragIdx === null || dragIdx === targetIdx) return;
      move(dragIdx, targetIdx);
      setDragIdx(targetIdx);
    },
    [dragIdx, move, disabled],
  );

  const scenario = item.content.scenario as string | undefined;

  return (
    <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[24px_26px] mb-6">
      {scenario && (
        <p className="text-[15.5px] font-bold text-[#1A1A1A] leading-[1.5] mb-1.5">
          {scenario}
        </p>
      )}
      <p className="text-[12.5px] text-[#808080] mb-[18px]">
        Drag and drop, or use the arrow buttons. Top of the list = most important.
      </p>

      <div ref={listRef} className="flex flex-col gap-[10px]">
        {ranked.map((optionId, idx) => {
          const opt = options.find((o) => o.id === optionId);
          return (
            <div
              key={`rank-item-${optionId || idx}-${idx}`}
              draggable={!disabled}
              onDragStart={handleDragStart(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver(idx)}
              className={`flex items-center gap-3 bg-white border-[1.5px] border-[#E6E6E6] rounded-xl px-4 py-[14px] select-none transition-all ${
                disabled
                  ? 'cursor-not-allowed opacity-60 pointer-events-none'
                  : 'cursor-grab hover:border-[#387DFF] hover:bg-[#EBF6FF]'
              } ${dragIdx === idx ? 'opacity-50' : ''}`}
            >
              <div className="w-[30px] h-[30px] rounded-full bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center text-[13px] font-black shrink-0">
                {idx + 1}
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-[#1A1A1A] leading-[1.45]">
                {opt?.text ?? opt?.label ?? optionId}
              </span>
              <div className="text-[#ADADAD] flex">
                <GripIcon />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RankItem;
