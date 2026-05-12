import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { validateEmail, validatePassword } from '../../utils/validation';
import { GoogleIcon, AppleIcon } from '../../components/common/Icons';


const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

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

  const handleLogin = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    console.log('Logging in user:', { email, password });
    
    // Future: API call to authenticate user
    
    navigate('/');
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="max-w-xl mx-auto py-12 sm:py-20 px-4">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-[24px] font-bold mb-3 text-[#1C1C1C] leading-[32px] tracking-[-1%] font-['Nunito_Sans']">
          Welcome back to VORA
        </h1>
        <p className="text-[#6B7280] text-sm sm:text-[1.1rem] max-w-md mx-auto">
          Access your dashboard to manage jobs, mentorships, and career growth.
        </p>
      </div>

      <form className="space-y-6 sm:space-y-8 max-w-[480px] mx-auto" autoComplete="off">
        <Input 
          label="Email address"
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
          disabled={!isFormValid}
        >
          Log in
        </Button>
      </form>

        <div className="flex items-center gap-4 py-1 my-9">
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
          <span className="text-xs font-bold text-[#6B7280]">OR</span>
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="social">
            <GoogleIcon />
            <span>Sign in with Google</span>
          </Button>
          <Button variant="social">
            <AppleIcon />
            <span>Sign in with Apple</span>
          </Button>
        </div>

        <p className="text-center text-[0.95rem] text-[#374151] pt-15">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-[#2563EB] hover:underline decoration-2 underline-offset-4 cursor-pointer">
            Create an account
          </Link>
        </p>
    </div>
  );
};

export default Login;
