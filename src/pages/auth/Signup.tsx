import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { validateEmail, validateWorkEmail, validatePassword, validateAccountType } from '../../utils/validation';
import { AppleIcon } from '../../components/common/Icons';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { useSignupMutation } from '../../services/queries/auth';


const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('');
  const [formError, setFormError] = useState('');

  const signupMutation = useSignupMutation();

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    accountType: false
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
    return email && password && accountType && !emailError && !passwordError && !accountTypeError;
  }, [email, password, accountType, emailError, passwordError, accountTypeError]);

  const handleSignup = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setFormError('');
    try {
      const backendRole = accountType.toUpperCase() as 'TALENT' | 'EMPLOYER' | 'MENTOR';
      await signupMutation.mutateAsync({ email, password, role: backendRole });

      // Route all standard form signups to OTP verification first
      navigate('/verify-email', { state: { email, accountType } });
    } catch (error: any) {
      setFormError(error?.message || 'Registration failed. Please try again.');
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="max-w-xl mx-auto py-12 sm:py-20 px-4">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-[24px] font-medium mb-3 text-[#1C1C1C] leading-[32px] tracking-[-1%] ">
          Start your Journey in Global health
        </h1>
        <p className="text-[#6B7280] text-sm sm:text-lg max-w-md mx-auto">
          Join thousands of professionals shaping the future of public health.
        </p>
      </div>

      {formError && (
        <div className="max-w-[480px] mx-auto mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm font-medium text-red-600">{formError}</p>
        </div>
      )}

      <form className="space-y-6 sm:space-y-8 max-w-[480px] mx-auto" autoComplete="off">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="Enter email address"
          error={!!emailError}
          helperText={emailError}
          autoComplete="off"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder="Enter password"
          showPasswordToggle
          error={!!passwordError}
          helperText={passwordError}
          autoComplete="new-password"
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

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
          <span className="text-xs font-medium text-[#6B7280]">OR</span>
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <GoogleSignInButton label="Sign up with Google" disabled={signupMutation.isPending} />
          <Button variant="social" disabled={signupMutation.isPending}>
            <AppleIcon />
            <span>Sign up with Apple</span>
          </Button>
        </div>

        <p className="text-center text-[0.95rem] text-[#374151] pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#2563EB] hover:underline decoration-2 underline-offset-4 cursor-pointer">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
