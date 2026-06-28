interface OptionButtonProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected = false,
  disabled = false,
  onClick,
  className = '',
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
      selected
        ? 'border-[#0047CC] bg-[#EBF6FF] text-[#0047CC]'
        : 'border-[#E6E6E6] bg-white text-[#1A1A1A] hover:border-[#C7E0FF]'
    } ${className}`}
  >
    {label}
  </button>
);

export default OptionButton;
