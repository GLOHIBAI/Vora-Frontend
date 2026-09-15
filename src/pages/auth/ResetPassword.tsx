import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  authFooterLinkClass,
} from '../../components/auth/AuthPageLayout';
import { useResetPasswordMutation } from '../../services/queries/auth';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import AuthHeroVideoCarousel from '../../components/auth/AuthHeroVideoCarousel';
import { validatePassword, validateEmail } from '../../utils/validation';
import { useBlockBrowserAutofill } from '../../hooks/useBlockBrowserAutofill';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug?: string }>();
  const locationState = (location.state as { email?: string; code?: string; roleSlug?: string }) || {};

  const activeSlug = slug || locationState.roleSlug || '';
  const initialEmail = locationState.email || '';
  const initialCode = locationState.code || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [formError, setFormError] = useState('');

  // If user navigates directly without code or email, redirect to forgot-password
  useEffect(() => {
    if (!initialEmail || !initialCode) {
      const forgotPath = activeSlug ? `/role/${activeSlug}/forgot-password` : '/forgot-password';
      navigate(forgotPath, { replace: true, state: { roleSlug: activeSlug } });
    }
  }, [initialEmail, initialCode, activeSlug, navigate]);

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

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const emailError = touched.email ? validateEmail(email) : '';
  const passwordError = touched.newPassword ? validatePassword(newPassword) : '';
  const confirmPasswordError =
    touched.confirmPassword && confirmPassword !== newPassword
      ? 'Passwords do not match'
      : '';

  const isFormValid =
    email.trim() !== '' &&
    !validateEmail(email) &&
    code.trim().length === 6 &&
    newPassword.trim() !== '' &&
    !validatePassword(newPassword) &&
    confirmPassword === newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true,
      newPassword: true,
      confirmPassword: true,
    });

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
        code: code.trim(),
        password: newPassword,
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
      const errMsg = err?.message || 'Failed to reset password. Please check your verification code and try again.';
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
    <AuthPageShell
      loading={showFullPage}
      centered={!role}
      className={role ? 'flex-1 !min-h-0' : ''}
      heroContent={<AuthHeroVideoCarousel />}
    >
      <AuthPageHeader
        title="Set a new password"
        subtitle={
          email ? (
            <>
              Enter your new password below for <strong className="text-[#1A1A1A]">{email}</strong>.
            </>
          ) : (
            'Choose your new password below.'
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
              Login
            </Link>
          </p>
        </AuthForm>
      </AuthFormCard>
    </AuthPageShell>
  );

  if (role) {
    return (
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        <AuthTopNav logoTo={`/role/${activeSlug}`} loginTo="" />
        <RoleApplyContextBanner role={role} />
        {resetPasswordContent}
      </div>
    );
  }

  return resetPasswordContent;
};

export default ResetPassword;
