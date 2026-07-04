interface OptionButtonProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  index?: number;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected = false,
  disabled = false,
  onClick,
  className = '',
  index,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`w-full text-left px-5 py-4 rounded-xl border text-[14px] transition-all flex items-start gap-4 ${
      selected
        ? 'border-[#0047CC] bg-[#FBFCFF] text-[#0047CC] font-semibold ring-[0.5px] ring-[#0047CC]'
        : 'border-[#E6E6E6] bg-white text-[#4A4A4A] hover:border-[#ADADAD] hover:bg-[#FAFBFD] disabled:hover:border-[#E6E6E6] disabled:hover:bg-white'
    } ${disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'} ${className}`}
  >
    {index !== undefined && (
      <span className={`w-[24px] h-[24px] rounded-full border flex items-center justify-center text-[11px] font-[800] shrink-0 transition-colors ${
        selected
          ? 'border-[#0047CC] bg-[#0047CC] text-white'
          : 'border-[#E6E6E6] bg-[#FAFBFD] text-[#808080]'
      }`}>
        {String.fromCharCode(65 + index)}
      </span>
    )}
    <span className="leading-[1.5] pt-[1.5px]">{label}</span>
  </button>
);

export default OptionButton;
