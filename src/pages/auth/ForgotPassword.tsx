import React, { useState, useMemo, useCallback } from 'react';
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
import { useForgotPasswordMutation } from '../../services/queries/auth';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import AuthHeroVideoCarousel from '../../components/auth/AuthHeroVideoCarousel';
import { validateEmail } from '../../utils/validation';
import { useBlockBrowserAutofill } from '../../hooks/useBlockBrowserAutofill';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug?: string }>();
  const locationState = (location.state as { email?: string; roleSlug?: string }) || {};

  const [email, setEmail] = useState(locationState.email || '');
  const [touched, setTouched] = useState(false);
  const [formError, setFormError] = useState('');

  const activeSlug = slug || locationState.roleSlug || '';
  const { data: roleResponse, isLoading: isRoleLoading } = useGetPublicRoleQuery(activeSlug || '');

  const role: PublicRoleLandingData | null = useMemo(() => {
    if (!activeSlug) return null;
    const apiData = roleResponse?.data || roleResponse;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(activeSlug);
    }
    return mapApiResponseToRoleData(activeSlug, apiData);
  }, [roleResponse, activeSlug]);

  const forgotPasswordMutation = useForgotPasswordMutation();

  const emailError = touched ? validateEmail(email) : '';
  const isFormValid = email.trim() !== '' && !validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const validationErr = validateEmail(email);
    if (validationErr) {
      return;
    }

    setFormError('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await forgotPasswordMutation.mutateAsync({ email: cleanEmail });
      const successMessage = res?.message || 'If an account exists, a password reset code has been sent';
      toast.success(successMessage);

      const targetRoute = activeSlug ? `/role/${activeSlug}/verify-email` : '/verify-email';
      navigate(targetRoute, {
        state: {
          email: cleanEmail,
          roleSlug: activeSlug,
          flow: 'reset-password',
          isResetPassword: true,
        },
      });
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      const errMsg = err?.message || 'Failed to send password reset code. Please try again.';
      setFormError(errMsg);
    }
  };

  const showFullPage = useFullPageLoading(
    forgotPasswordMutation.isPending || (!!activeSlug && isRoleLoading),
    forgotPasswordMutation.isPending,
  );

  const clearCredentials = useCallback(() => {
    setEmail('');
  }, []);

  const emailAutofillBlock = useBlockBrowserAutofill(clearCredentials);

  const loginPath = activeSlug ? `/role/${activeSlug}/login` : '/login';

  const forgotPasswordContent = (
    <AuthPageShell
      loading={showFullPage}
      centered={!role}
      className={role ? 'flex-1 !min-h-0' : ''}
      heroContent={<AuthHeroVideoCarousel />}
    >
      <AuthPageHeader
        title="Reset your password"
        subtitle="Enter your email address and we'll send you a 6-digit code to reset your password."
        showLogo={!role}
      />

      <AuthFormCard>
        {formError ? <AuthErrorBanner message={formError} /> : null}

        <AuthForm className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="vora-forgot-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Enter email address"
            error={!!emailError}
            helperText={emailError}
            {...emailAutofillBlock}
          />

          <Button
            variant={isFormValid ? 'primary' : 'secondary'}
            type="submit"
            disabled={!isFormValid || forgotPasswordMutation.isPending}
            isLoading={forgotPasswordMutation.isPending}
          >
            Send reset code
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
        {forgotPasswordContent}
      </div>
    );
  }

  return forgotPasswordContent;
};

export default ForgotPassword;
