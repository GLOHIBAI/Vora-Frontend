import React, { useCallback, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { validateEmail } from '../../utils/validation';
import { AppleIcon } from '../../components/common/Icons';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import {
  AuthPageShell,
  AuthPageHeader,
  AuthForm,
  AuthFormCard,
  AuthErrorBanner,
  AuthSocialDivider,
  AuthSocialButtons,
  authFooterLinkClass,
} from '../../components/auth/AuthPageLayout';
import { useLoginMutation } from '../../services/queries/auth';
import { routeAfterAuth } from '../../utils/auth';
import { useAuth } from '../../context/AuthContext';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';
import { useBlockBrowserAutofill } from '../../hooks/useBlockBrowserAutofill';
import AuthTopNav from '../../components/auth/AuthTopNav';
import RoleApplyContextBanner from '../../components/auth/RoleApplyContextBanner';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { isLoading: isAuthLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const loginMutation = useLoginMutation();

  const { data: response, isLoading: isRoleLoading } = useGetPublicRoleQuery(slug || '');

  const role: PublicRoleLandingData | null = useMemo(() => {
    if (!slug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(slug);
    }
    return mapApiResponseToRoleData(slug, apiData);
  }, [response, slug]);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const emailError = useMemo(() => {
    if (!touched.email) return '';
    return validateEmail(email);
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return '';
    if (!password) return 'Password is required';
    return '';
  }, [password, touched.password]);

  const isFormValid = useMemo(() => {
    return email && password && !emailError && !passwordError;
  }, [email, password, emailError, passwordError]);

  const handleLogin = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setFormError('');

    try {
      const payload: any = { email, password };
      if (slug) {
        payload.roleLink = slug;
      }
      const response = await loginMutation.mutateAsync(payload);
      const authData = response.data;
      const user = authData?.user;

      if (user) {
        let targetRoute = routeAfterAuth(user);
        const isRestrictedRole = slug && user.role && user.role.toUpperCase() !== 'TALENT';

        if (slug && user.role?.toUpperCase() === 'TALENT') {
          localStorage.setItem('active_assessment_role_slug', slug);
          if (targetRoute !== '/verify-email' && targetRoute !== '/select-type') {
            targetRoute = `/onboarding/talent/${slug}/assessment/journey`;
          }
        }

        navigate(targetRoute, { 
          state: { 
            email, 
            accountType: user.role,
            ...(isRestrictedRole ? { showRoleRestrictedModal: true } : {})
          } 
        });
      } else {
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      const errMsg = err?.message || 'Invalid email or password. Please try again.';
      if (
        errMsg.toLowerCase().includes('email not verified') ||
        errMsg.toLowerCase().includes('verification email') ||
        errMsg.toLowerCase().includes('not verified')
      ) {
        navigate('/verify-email', { state: { email } });
      } else {
        setFormError(errMsg);
      }
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showFullPage = useFullPageLoading(
    isAuthLoading || loginMutation.isPending || (!!slug && isRoleLoading),
    loginMutation.isPending,
  );

  const clearCredentials = useCallback(() => {
    setEmail('');
    setPassword('');
  }, []);

  const emailAutofillBlock = useBlockBrowserAutofill(clearCredentials);
  const passwordAutofillBlock = useBlockBrowserAutofill(clearCredentials, {
    forPassword: true,
  });

  const loginContent = (
    <AuthPageShell loading={showFullPage} centered={!role} className={role ? "flex-1 !min-h-0" : ""}>
      <AuthPageHeader
        title="Welcome back to Vora."
        subtitle="Access your dashboard to manage jobs, mentorships, and career growth."
      />

      <AuthFormCard>
        {formError ? <AuthErrorBanner message={formError} /> : null}

        <AuthForm className="space-y-6 sm:space-y-8">
          <Input
            label="Email"
            type="email"
            name="vora-login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="Enter email address"
            error={!!emailError}
            helperText={emailError}
            {...emailAutofillBlock}
          />

          <Input
            label="Password"
            type="password"
            name="vora-login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="Enter password"
            showPasswordToggle
            error={!!passwordError}
            helperText={passwordError}
            {...passwordAutofillBlock}
          />

          <Button
            variant={isFormValid ? 'primary' : 'secondary'}
            type="submit"
            onClick={handleLogin}
            disabled={!isFormValid || loginMutation.isPending}
            isLoading={loginMutation.isPending}
          >
            Log in
          </Button>

          <AuthSocialDivider />

          <AuthSocialButtons>
            <GoogleSignInButton disabled={loginMutation.isPending} roleSlug={slug} />
            <Button variant="social" disabled={loginMutation.isPending} className="min-w-0">
              <AppleIcon />
              <span className="truncate">Sign in with Apple</span>
            </Button>
          </AuthSocialButtons>

          <p className="pt-2 text-center text-sm text-[#374151] sm:text-[0.95rem]">
            Don&apos;t have an account?{' '}
            <Link to={slug ? `/role/${slug}/signup` : "/signup"} className={authFooterLinkClass}>
              Create an account
            </Link>
          </p>
        </AuthForm>
      </AuthFormCard>
    </AuthPageShell>
  );

  if (role) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AuthTopNav logoTo={`/role/${slug}`} loginTo="" />
        <RoleApplyContextBanner role={role} />
        {loginContent}
      </div>
    );
  }

  return loginContent;
};

export default Login;
