import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { validateEmail, validateWorkEmail, validatePassword, validateAccountType } from '../../utils/validation';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34a853"/>
    <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.96H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.041l3.007-2.334z" fill="#fbbc05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#ea4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18">
    <path d="M14.654 12.016c-.76.76-1.52 1.52-2.394 1.52-.844 0-1.14-.506-2.109-.506-.97 0-1.266.506-2.109.506-.875 0-1.634-.76-2.394-1.52-1.554-1.554-2.67-4.397-1.14-6.938.76-1.266 2.067-2.067 3.29-2.067 1.266 0 1.984.76 2.744.76s1.477-.76 2.744-.76c1.055 0 2.394.633 3.123 1.554-2.109 1.266-1.758 3.882.38 4.71-.348.97-.844 1.984-1.554 2.743zM10.198 3.55c0-1.554 1.266-2.743 2.743-2.743 0 1.554-1.266 2.743-2.743 2.743z" fill="currentColor"/>
  </svg>
);

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('');
  
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

  const handleSignup = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    console.log('Registering user:', { email, password, accountType });
    
    // Future: API call to register user
    
    // Route to OTP verification
    navigate('/verify-otp', { state: { email, accountType } });
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="max-w-xl mx-auto py-12 sm:py-20 px-4">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-[24px] font-bold mb-3 text-[#1C1C1C] leading-[32px] tracking-[-1%] font-['Nunito_Sans']">
          Start your Journey in Global health
        </h1>
        <p className="text-[#6B7280] text-sm sm:text-lg max-w-md mx-auto">
          Join thousands of professionals shaping the future of public health.
        </p>
      </div>

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
          disabled={!isFormValid}
        >
          Get started
        </Button>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
          <span className="text-xs font-bold text-[#6B7280]">OR</span>
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="social">
            <GoogleIcon />
            <span>Sign up with Google</span>
          </Button>
          <Button variant="social">
            <AppleIcon />
            <span>Sign up with Apple</span>
          </Button>
        </div>

        <p className="text-center text-[0.95rem] text-[#374151] pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#2563EB] hover:underline decoration-2 underline-offset-4 cursor-pointer">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
