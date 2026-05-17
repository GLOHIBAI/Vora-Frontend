import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { validateEmail } from '../../utils/validation';
import { AppleIcon } from '../../components/common/Icons';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { useLoginMutation } from '../../services/queries/auth';
import { routeAfterAuth } from '../../utils/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const loginMutation = useLoginMutation();

  const [touched, setTouched] = useState({
    email: false,
    password: false
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
      const response = await loginMutation.mutateAsync({ email, password });
      const authData = response.data;
      const user = authData?.user;

      if (user) {
        const targetRoute = routeAfterAuth(user);
        navigate(targetRoute, { state: { email, accountType: user.role } });
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errMsg = error?.message || 'Invalid email or password. Please try again.';
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
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="max-w-xl mx-auto py-12 sm:py-20 px-4">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-[24px] font-medium mb-3 text-[#1C1C1C] leading-[32px] tracking-[-1%] ">
          Welcome back to VORA
        </h1>
        <p className="text-[#6B7280] text-sm sm:text-lg max-w-md mx-auto">
          Access your dashboard to manage jobs, mentorships, and career growth.
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
          autoComplete="current-password"
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

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
          <span className="text-xs font-medium text-[#6B7280]">OR</span>
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <GoogleSignInButton disabled={loginMutation.isPending} />
          <Button variant="social" disabled={loginMutation.isPending}>
            <AppleIcon />
            <span>Sign in with Apple</span>
          </Button>
        </div>

        <p className="text-center text-[0.95rem] text-[#374151] pt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-[#2563EB] hover:underline decoration-2 underline-offset-4 cursor-pointer">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
