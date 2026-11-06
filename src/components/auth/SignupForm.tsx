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
import { loadCourseEnrollContext } from '../../utils/courseSignup';

export interface SignupFormProps {
  /** When set, account type is locked to Talent (role-link signup). */
  roleSlug?: string;
  courseSlug?: string;
  showFooterLogin?: boolean;
  loginTo?: string;
  accountType?: string;
  onAccountTypeChange?: (type: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  roleSlug,
  courseSlug,
  showFooterLogin = true,
  loginTo = '/login',
  accountType: controlledAccountType,
  onAccountTypeChange,
}) => {
  const navigate = useNavigate();
  const isRoleSignup = Boolean(roleSlug);
  const isCourseSignup = Boolean(courseSlug);
  const isLockedToTalent = isRoleSignup || isCourseSignup;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [localAccountType, setLocalAccountType] = useState(isLockedToTalent ? 'Talent' : (controlledAccountType || ''));
  const accountType = controlledAccountType !== undefined ? controlledAccountType : localAccountType;

  const handleAccountTypeChange = (newType: string) => {
    setLocalAccountType(newType);
    onAccountTypeChange?.(newType);
  };

  const [formError, setFormError] = useState('');

  const signupMutation = useSignupMutation();

  const [touched, setTouched] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
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

  const firstNameError = useMemo(() => {
    if (!isCourseSignup || !touched.firstName) return '';
    return !firstName.trim() ? 'First name is required' : '';
  }, [isCourseSignup, touched.firstName, firstName]);

  const lastNameError = useMemo(() => {
    if (!isCourseSignup || !touched.lastName) return '';
    return !lastName.trim() ? 'Last name is required' : '';
  }, [isCourseSignup, touched.lastName, lastName]);

  const accountTypeError = useMemo(() => {
    if (isLockedToTalent) return '';
    if (!touched.accountType) return '';
    return validateAccountType(accountType);
  }, [accountType, touched.accountType, isLockedToTalent]);

  const isFormValid = useMemo(() => {
    return Boolean(
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
    if (!isFormValid) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        accountType: true,
      });
      return;
    }

    setFormError('');

    try {
      const backendRole = accountType.toUpperCase() as 'TALENT' | 'EMPLOYER' | 'MENTOR';
      const payload: any = { email, password, role: backendRole };
      if (roleSlug) {
        payload.roleLink = roleSlug;
      }
      if (isCourseSignup) {
        const courseContext = loadCourseEnrollContext();
        payload.courseId = courseContext?.courseId || courseSlug;

        try {
          localStorage.setItem('vora_user_track', 'learner');
        } catch {}
      }
      await signupMutation.mutateAsync(payload);
      navigate('/verify-email', {
        state: { email, accountType, roleSlug, courseSlug },
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      setFormError(err?.message || 'Registration failed. Please check your credentials and try again.');
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

      <AuthForm className="space-y-4">
        
        <Input
          label="Email"
          type="email"
          name="vora-signup-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="name@example.com"
          error={!!emailError}
          helperText={emailError}
          required
          {...emailAutofillBlock}
        />

        <Input
          label="Password"
          type="password"
          name="vora-signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder="Enter secure password"
          showPasswordToggle
          error={!!passwordError}
          helperText={passwordError || (!touched.password ? 'Must be at least 8 characters' : '')}
          required
          {...passwordAutofillBlock}
        />

        {/* Account Type Selection (Only shown when not enrolling in a course) */}
        {!isCourseSignup && (
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Account type
            </label>
            {isRoleSignup ? (
              <TalentAccountTypeBadge />
            ) : (
              <Select
                value={accountType}
                onChange={(e) => handleAccountTypeChange(e.target.value)}
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
        )}

        <div className="pt-1">
          <Button
            variant={isFormValid ? 'primary' : 'secondary'}
            type="submit"
            fullWidth
            onClick={handleSignup}
            disabled={!isFormValid || signupMutation.isPending}
            isLoading={signupMutation.isPending}
            className="h-11 sm:h-12 rounded-xl font-semibold text-sm sm:text-base bg-[#0047CC] hover:bg-[#0039A6] text-white shadow-xs cursor-pointer"
          >
            {isCourseSignup ? 'Start Learning' : 'Get started'}
          </Button>
        </div>

        <AuthSocialDivider />

        <AuthSocialButtons>
          <GoogleSignInButton
            label="Sign up with Google"
            disabled={signupMutation.isPending}
            roleSlug={roleSlug}
            email={email}
          />
          <Button variant="social" disabled={signupMutation.isPending} className="min-w-0">
            <AppleIcon size={18} />
            <span className="whitespace-nowrap">Sign up with Apple</span>
          </Button>
        </AuthSocialButtons>

        {/* Fine Print: Legal terms and conditions */}
        <p className="text-center text-[12px] text-slate-500 leading-relaxed px-2 pt-1">
          By signing up, you agree to VORA&apos;s{' '}
          <Link to="/terms" className="text-slate-700 underline hover:text-[#0047CC]">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-slate-700 underline hover:text-[#0047CC]">
            Privacy Policy
          </Link>
          .
        </p>

        {showFooterLogin ? (
          <p className="pt-1 text-center text-sm text-slate-600 font-medium">
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
