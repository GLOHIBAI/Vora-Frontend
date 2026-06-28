import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import { getLikertQuestions } from '../../../../utils/assessmentItems';

const DEFAULT_LABELS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
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
    <div className="space-y-4">
      {statements.map((statement, idx) => {
        const labels = statement.scaleLabels?.length ? statement.scaleLabels : DEFAULT_LABELS;
        return (
          <AssessmentItemCard key={statement.id} label={`Statement ${idx + 1}`} title={statement.text}>
            <div className="flex flex-wrap gap-2">
              {labels.map((label, rating) => {
                const selected = answerMap[statement.id] === rating + 1;
                return (
                  <button
                    key={`${statement.id}-${label}`}
                    type="button"
                    disabled={rowLocked(statement.id)}
                    onClick={() => onChange(rating + 1, statement.id)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
                      selected
                        ? 'border-[#0047CC] bg-[#EBF6FF] text-[#0047CC]'
                        : 'border-[#E6E6E6] text-[#4A4A4A]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </AssessmentItemCard>
        );
      })}
    </div>
  );
};

export default LikertItem;
