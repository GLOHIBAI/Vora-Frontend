interface AssessmentItemCardProps {
  label?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const AssessmentItemCard: React.FC<AssessmentItemCardProps> = ({
  label,
  title,
  children,
  className = '',
}) => (
  <div className={`bg-white border border-[#E6E6E6] rounded-xl p-5 ${className}`}>
    {label ? (
      <p className="text-sm font-semibold text-[#ADADAD] uppercase mb-2">{label}</p>
    ) : null}
    {title ? (
      <p className="text-base font-semibold text-[#1A1A1A] mb-4 leading-relaxed">{title}</p>
    ) : null}
    {children}
  </div>
);

export default AssessmentItemCard;
