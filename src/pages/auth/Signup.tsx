import React, { useCallback, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import {
  validateEmail,
  validateWorkEmail,
  validatePassword,
  validateAccountType,
} from '../../utils/validation';
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
import { useSignupMutation } from '../../services/queries/auth';
import { useAuth } from '../../context/AuthContext';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';
import { useBlockBrowserAutofill } from '../../hooks/useBlockBrowserAutofill';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('');
  const [formError, setFormError] = useState('');

  const signupMutation = useSignupMutation();

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    accountType: false,
  });

  const emailError = useMemo(() => {
    if (!touched.email) return '';
    return accountType === 'Employer' ? validateWorkEmail(email) : validateEmail(email);
  }, [email, touched.email, accountType]);

  const passwordError = useMemo(() => {
    if (!touched.password) return '';
    return validatePassword(password);
  }, [password, touched.password]);

  const accountTypeError = useMemo(() => {
    if (!touched.accountType) return '';
    return validateAccountType(accountType);
  }, [accountType, touched.accountType]);

  const isFormValid = useMemo(() => {
    return (
      email &&
      password &&
      accountType &&
      !emailError &&
      !passwordError &&
      !accountTypeError
    );
  }, [email, password, accountType, emailError, passwordError, accountTypeError]);

  const handleSignup = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setFormError('');
    try {
      const backendRole = accountType.toUpperCase() as 'TALENT' | 'EMPLOYER' | 'MENTOR';
      await signupMutation.mutateAsync({ email, password, role: backendRole });
      navigate('/verify-email', { state: { email, accountType } });
    } catch (error: unknown) {
      const err = error as { message?: string };
      setFormError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showFullPage = useFullPageLoading(
    isAuthLoading || signupMutation.isPending,
    signupMutation.isPending,
  );

  const clearCredentials = useCallback(() => {
    setEmail('');
    setPassword('');
  }, []);

  const emailAutofillBlock = useBlockBrowserAutofill(clearCredentials);
  const passwordAutofillBlock = useBlockBrowserAutofill(clearCredentials, {
    forPassword: true,
  });

  return (
    <AuthPageShell loading={showFullPage}>
      <AuthPageHeader
        title="Start your Journey in Global health"
        subtitle="Join thousands of professionals shaping the future of public health."
      />

      <AuthFormCard>
        {formError ? <AuthErrorBanner message={formError} /> : null}

        <AuthForm className="space-y-6 sm:space-y-8">
          <Input
            label="Email"
            type="email"
            name="vora-signup-email"
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
            name="vora-signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="Enter password"
            showPasswordToggle
            error={!!passwordError}
            helperText={passwordError}
            {...passwordAutofillBlock}
          />

          <Select
            label="Account type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            onBlur={() => handleBlur('accountType')}
            placeholder="Select account type"
            options={[
              { label: 'Talent', value: 'Talent' },
              { label: 'Employer', value: 'Employer' },
              { label: 'Mentor', value: 'Mentor' },
            ]}
            error={!!accountTypeError}
            helperText={accountTypeError}
          />

          <Button
            variant={isFormValid ? 'primary' : 'secondary'}
            type="submit"
            onClick={handleSignup}
            disabled={!isFormValid || signupMutation.isPending}
            isLoading={signupMutation.isPending}
          >
            Get started
          </Button>

          <AuthSocialDivider />

          <AuthSocialButtons>
            <GoogleSignInButton
              label="Sign up with Google"
              disabled={signupMutation.isPending}
            />
            <Button variant="social" disabled={signupMutation.isPending} className="min-w-0">
              <AppleIcon />
              <span className="truncate">Sign up with Apple</span>
            </Button>
          </AuthSocialButtons>

          <p className="pt-2 text-center text-sm text-[#374151] sm:text-[0.95rem]">
            Already have an account?{' '}
            <Link to="/login" className={authFooterLinkClass}>
              Log in
            </Link>
          </p>
        </AuthForm>
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default Signup;
