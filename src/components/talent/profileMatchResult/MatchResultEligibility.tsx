interface MatchResultEligibilityProps {
  title: string;
  body: string;
}

const MatchResultEligibility: React.FC<MatchResultEligibilityProps> = ({ title, body }) => (
  <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 mb-5 text-left">
    <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-1">{title}</h2>
    <p className="text-[13px] text-[#808080] leading-relaxed">{body}</p>
  </div>
);

export default MatchResultEligibility;
