import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { GoogleIcon } from '../common/Icons';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { getGoogleClientId } from '../../lib/googleAuth';

interface GoogleSignInButtonProps {
  label?: string;
  disabled?: boolean;
  /** Role-link signup: navigate to OTP (no Google API until new endpoint is provided). */
  roleSlug?: string;
  email?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  label = 'Sign in with Google',
  disabled = false,
  roleSlug,
  email,
}) => {
  const navigate = useNavigate();
  const { handleGoogleSignIn, isGoogleLoading } = useGoogleAuth();
  const isConfigured = !!getGoogleClientId();

  const handleClick = () => {
    handleGoogleSignIn(roleSlug);
  };

  return (
    <Button
      variant="social"
      type="button"
      className="min-w-0"
      onClick={handleClick}
      disabled={disabled || isGoogleLoading || (!roleSlug && !isConfigured)}
      isLoading={isGoogleLoading && !roleSlug}
    >
      <GoogleIcon size={18} />
      <span className="whitespace-nowrap">{label}</span>
    </Button>
  );
};

export default GoogleSignInButton;
