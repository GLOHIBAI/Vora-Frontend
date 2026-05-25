import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import {
  AuthPageShell,
  AuthPageHeader,
  AuthFormCard,
  AuthErrorBanner,
  AuthOtpInputGrid,
} from '../../components/auth/AuthPageLayout';
import {
  useVerifyOTPMutation,
  useResendOTPMutation,
  useOAuthVerifyMutation,
  useOAuthResendOtpMutation,
} from '../../services/queries/auth';
import { routeAfterAuth } from '../../utils/auth';
import { resolveOAuthNavigation } from '../../utils/oauth';
import { useAuth } from '../../context/AuthContext';
import { getSetupToken } from '../../utils/oauth';
import type { VerifyLocationState } from '../../types';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';

const VerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, setSetupToken } = useAuth();
  const state = (location.state as VerifyLocationState) || {};
  const { email = '', oauth = false, otpExpiresInMinutes = 10 } = state;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(oauth ? otpExpiresInMinutes * 60 : 60);
  const [formError, setFormError] = useState('');
  const verifyMutation = useVerifyOTPMutation();
  const resendMutation = useResendOTPMutation();
  const oauthVerifyMutation = useOAuthVerifyMutation();
  const oauthResendMutation = useOAuthResendOtpMutation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isOAuthFlow = oauth || !!getSetupToken();

  useEffect(() => {
    if (isOAuthFlow && !getSetupToken()) {
      navigate('/login', { replace: true });
    }
  }, [isOAuthFlow, navigate]);

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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== '');
  const isPending = isOAuthFlow ? oauthVerifyMutation.isPending : verifyMutation.isPending;
  const isResending = isOAuthFlow ? oauthResendMutation.isPending : resendMutation.isPending;
  const buttonLoading = isPending || isResending;
  const showFullPage = useFullPageLoading(isPending || isResending, buttonLoading);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    setFormError('');
    const code = otp.join('');

    try {
      if (isOAuthFlow) {
        const response = await oauthVerifyMutation.mutateAsync({ code });
        const { route, state: navState } = resolveOAuthNavigation(
          response.data,
          login,
          setSetupToken,
        );
        navigate(route, { state: navState });
        return;
      }

      const response = await verifyMutation.mutateAsync({ email, code });
      const authData = response.data;
      const user = authData?.user;

      if (user) {
        const targetRoute = routeAfterAuth(user);
        navigate(targetRoute, { state: { email, accountType: user.role } });
      } else {
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setFormError(err?.message || 'Invalid verification code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setFormError('');

    try {
      if (isOAuthFlow) {
        await oauthResendMutation.mutateAsync();
      } else {
        await resendMutation.mutateAsync({ email });
      }
      setTimer(isOAuthFlow ? otpExpiresInMinutes * 60 : 60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const err = error as { message?: string };
      setFormError(err?.message || 'Failed to resend verification code. Please try again.');
    }
  };

  return (
    <AuthPageShell loading={showFullPage}>
      <AuthPageHeader
        title="Verify your email"
        subtitle={
          <>
            We&apos;ve sent a 6-digit verification code to{' '}
            <span className="break-all font-medium text-gray-900">
              {email || 'your email'}
            </span>
            . Enter the code below to verify your email.
          </>
        }
      />

      <AuthFormCard>
        {formError ? <AuthErrorBanner message={formError} /> : null}

        <form onSubmit={handleVerify} className="space-y-8 sm:space-y-10" autoComplete="off">
          <AuthOtpInputGrid
            otp={otp}
            inputRefs={inputRefs}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm font-medium text-[#6B7280]">
                Resend a new otp in{' '}
                <span className="font-medium text-[#0047CC]">{timer} secs</span>
              </p>
            ) : (
              <Button
                variant="link"
                onClick={handleResend}
                fullWidth={false}
                isLoading={isResending}
                className="mx-auto p-0 text-sm font-medium text-[#0047CC] underline decoration-2 underline-offset-4 hover:bg-transparent hover:text-blue-700"
              >
                Resend OTP
              </Button>
            )}
          </div>

          <Button
            variant={isComplete ? 'primary' : 'secondary'}
            type="submit"
            disabled={!isComplete || isPending}
            isLoading={isPending}
          >
            Verify email
          </Button>
        </form>
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default VerifyOTP;
