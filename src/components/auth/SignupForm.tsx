import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import {
  validateEmail,
  validateWorkEmail,
  validatePassword,
  validateAccountType,
} from '../../utils/validation';
import { AppleIcon } from '../common/Icons';
import GoogleSignInButton from './GoogleSignInButton';
import TalentAccountTypeBadge from './TalentAccountTypeBadge';
import {
  AuthForm,
  AuthErrorBanner,
  AuthSocialDivider,
  AuthSocialButtons,
  authFooterLinkClass,
} from './AuthPageLayout';
import { useSignupMutation } from '../../services/queries/auth';
import { useBlockBrowserAutofill } from '../../hooks/useBlockBrowserAutofill';

export interface SignupFormProps {
  /** When set, account type is locked to Talent (role-link signup). */
  roleSlug?: string;
  showFooterLogin?: boolean;
  loginTo?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({
  roleSlug,
  showFooterLogin = true,
  loginTo = '/login',
}) => {
  const navigate = useNavigate();
  const isRoleSignup = Boolean(roleSlug);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState(isRoleSignup ? 'Talent' : '');
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
    if (isRoleSignup) return '';
    if (!touched.accountType) return '';
    return validateAccountType(accountType);
  }, [accountType, touched.accountType, isRoleSignup]);

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
      const payload: any = { email, password, role: backendRole };
      if (roleSlug) {
        payload.roleLink = roleSlug;
      }
      await signupMutation.mutateAsync(payload);
      navigate('/verify-email', {
        state: { email, accountType, roleSlug },
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      setFormError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const clearCredentials = useCallback(() => {
    setEmail('');
    setPassword('');
  }, []);

  const emailAutofillBlock = useBlockBrowserAutofill(clearCredentials);
  const passwordAutofillBlock = useBlockBrowserAutofill(clearCredentials, {
    forPassword: true,
  });

  return (
    <>
      {formError ? <AuthErrorBanner message={formError} /> : null}

      <AuthForm className="space-y-5 sm:space-y-6">
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

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Account type</label>
          {isRoleSignup ? (
            <TalentAccountTypeBadge />
          ) : (
            <Select
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
          )}
        </div>

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
            roleSlug={roleSlug}
            email={email}
          />
          <Button variant="social" disabled={signupMutation.isPending} className="min-w-0">
            <AppleIcon />
            <span className="truncate">Sign up with Apple</span>
          </Button>
        </AuthSocialButtons>

        {showFooterLogin ? (
          <p className="pt-2 text-center text-sm text-[#808080] font-medium">
            Already have an account?{' '}
            <Link to={loginTo} className={authFooterLinkClass}>
              Log in
            </Link>
          </p>
        ) : null}
      </AuthForm>
    </>
  );
};

export default SignupForm;
