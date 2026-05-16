import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const VerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || { email: 'test@vora.com' };
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    setIsLoading(true);
    console.log('Verifying OTP:', otp.join(''));
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      // Route to Employer onboarding
      navigate('/onboard/employer');
    }, 1000);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    console.log('Resending OTP to:', email);
  };

  return (
    <div className="max-w-xl mx-auto py-12 sm:py-20 px-4 flex flex-col items-center">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-[24px] font-bold mb-4 text-[#1C1C1C] leading-[32px] tracking-[-1%] font-['Nunito_Sans']">
          Verify your email
        </h1>
        <p className="text-[#6B7280] text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
          We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{email}</span>. Enter the code below to verify your email.
        </p>
      </div>

      <form onSubmit={handleVerify} className="w-full max-w-[480px] space-y-10">
        <div className="flex justify-between gap-2 sm:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-10 h-12 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          ))}
        </div>

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-[#6B7280] text-sm font-medium">
              Resend a new otp in <span className="text-[#0047CC] font-bold">{timer} secs</span>
            </p>
          ) : (
            <button 
              type="button"
              onClick={handleResend}
              className="text-[#0047CC] text-sm font-bold underline decoration-2 underline-offset-4 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Resend OTP
            </button>
          )}
        </div>

        <Button 
          variant={isComplete ? 'primary' : 'secondary'}
          type="submit"
          disabled={!isComplete}
          isLoading={isLoading}
        >
          Verify email
        </Button>
      </form>
    </div>
  );
};

export default VerifyOTP;
