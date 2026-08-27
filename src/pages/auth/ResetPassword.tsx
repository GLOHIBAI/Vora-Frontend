import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AuthTopNav from '../../components/auth/AuthTopNav';
import RoleApplyContextBanner from '../../components/auth/RoleApplyContextBanner';
import {
  AuthPageShell,
  AuthPageHeader,
  AuthFormCard,
  AuthForm,
  AuthErrorBanner,
  AuthOtpInputGrid,
  authFooterLinkClass,
} from '../../components/auth/AuthPageLayout';
import { useResetPasswordMutation, useForgotPasswordMutation } from '../../services/queries/auth';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import { validatePassword, validateEmail } from '../../utils/validation';
import { useBlockBrowserAutofill } from '../../hooks/useBlockBrowserAutofill';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug?: string }>();
  const locationState = (location.state as { email?: string; roleSlug?: string }) || {};

  const activeSlug = slug || locationState.roleSlug || '';
  const initialEmail = locationState.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(60);
  const [touched, setTouched] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [formError, setFormError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: roleResponse, isLoading: isRoleLoading } = useGetPublicRoleQuery(activeSlug || '');

  const role: PublicRoleLandingData | null = useMemo(() => {
    if (!activeSlug) return null;
    const apiData = roleResponse?.data || roleResponse;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(activeSlug);
    }
    return mapApiResponseToRoleData(activeSlug, apiData);
  }, [roleResponse, activeSlug]);

  const resetPasswordMutation = useResetPasswordMutation();
  const resendOtpMutation = useForgotPasswordMutation();

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Only accept numeric digits
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otp];

    // Support paste of entire 6-digit OTP
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = chars[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = cleaned.slice(-1);
    setOtp(newOtp);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || resendOtpMutation.isPending || !email.trim()) return;

    const emailErr = validateEmail(email);
    if (emailErr) {
      toast.error(emailErr);
      return;
    }

    try {
      await resendOtpMutation.mutateAsync({ email: email.trim().toLowerCase() });
      toast.success('A fresh 6-digit code has been sent to your email!');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Failed to resend code. Please try again.');
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const emailError = touched.email ? validateEmail(email) : '';
  const passwordError = touched.newPassword ? validatePassword(newPassword) : '';
  const confirmPasswordError =
    touched.confirmPassword && confirmPassword !== newPassword
      ? 'Passwords do not match'
      : '';

  const otpCode = otp.join('');
  const isOtpComplete = otpCode.length === 6;

  const isFormValid =
    email.trim() !== '' &&
    !validateEmail(email) &&
    isOtpComplete &&
    newPassword.trim() !== '' &&
    !validatePassword(newPassword) &&
    confirmPassword === newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true,
      otp: true,
      newPassword: true,
      confirmPassword: true,
    });

    if (!isOtpComplete) {
      setFormError('Please enter all 6 digits of the verification code.');
      return;
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      setFormError(passErr);
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setFormError('');

    try {
      const res = await resetPasswordMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        otp: otpCode,
        newPassword,
      });

      const successMessage = res?.message || 'Password reset successfully! Please log in.';
      toast.success(successMessage);

      const loginPath = activeSlug ? `/role/${activeSlug}/login` : '/login';
      navigate(loginPath, {
        state: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      const errMsg = err?.message || 'Failed to reset password. Please check your code and try again.';
      setFormError(errMsg);
    }
  };

  const showFullPage = useFullPageLoading(
    resetPasswordMutation.isPending || (!!activeSlug && isRoleLoading),
    resetPasswordMutation.isPending,
  );

  const clearCredentials = useCallback(() => {
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  const passwordAutofillBlock = useBlockBrowserAutofill(clearCredentials, {
    forPassword: true,
  });

  const loginPath = activeSlug ? `/role/${activeSlug}/login` : '/login';

  const resetPasswordContent = (
    <AuthPageShell loading={showFullPage} centered={!role} className={role ? 'flex-1 !min-h-0' : ''}>
      <AuthPageHeader
        title="Set a new password"
        subtitle={
          email ? (
            <>
              Enter the 6-digit code sent to <strong className="text-[#1A1A1A]">{email}</strong> and choose your new password.
            </>
          ) : (
            'Enter the 6-digit verification code and choose your new password.'
          )
        }
        showLogo={!role}
      />

      <AuthFormCard>
        {formError ? <AuthErrorBanner message={formError} /> : null}

        <AuthForm className="space-y-6 sm:space-y-7" onSubmit={handleSubmit}>
          {!initialEmail && (
            <Input
              label="Email"
              type="email"
              name="vora-reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="Enter email address"
              error={!!emailError}
              helperText={emailError}
            />
          )}

          {/* 6-Digit OTP Code Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#374151]">
                Verification Code
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0 || resendOtpMutation.isPending}
                className="text-xs font-medium text-[#0047CC] hover:text-[#0037A3] disabled:text-[#9CA3AF] disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
              </button>
            </div>
            <AuthOtpInputGrid
              otp={otp}
              inputRefs={inputRefs}
              onChange={handleOtpChange}
              onKeyDown={handleOtpKeyDown}
            />
          </div>

          <Input
            label="New Password"
            type="password"
            name="vora-reset-new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => handleBlur('newPassword')}
            placeholder="Enter new password"
            showPasswordToggle
            error={!!passwordError}
            helperText={passwordError || 'Must be at least 8 characters with upper, lower, number & symbol.'}
            {...passwordAutofillBlock}
          />

          <Input
            label="Confirm New Password"
            type="password"
            name="vora-reset-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Confirm new password"
            showPasswordToggle
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
            {...passwordAutofillBlock}
          />

          <Button
            variant={isFormValid ? 'primary' : 'secondary'}
            type="submit"
            disabled={!isFormValid || resetPasswordMutation.isPending}
            isLoading={resetPasswordMutation.isPending}
          >
            Reset password
          </Button>

          <p className="pt-2 text-center text-sm text-[#374151] sm:text-[0.95rem]">
            Remember your password?{' '}
            <Link to={loginPath} className={authFooterLinkClass}>
              Back to log in
            </Link>
          </p>
        </AuthForm>
      </AuthFormCard>
    </AuthPageShell>
  );

  if (role) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AuthTopNav logoTo={`/role/${activeSlug}`} loginTo="" />
        <RoleApplyContextBanner role={role} />
        {resetPasswordContent}
      </div>
    );
  }

  return resetPasswordContent;
};

export default ResetPassword;
