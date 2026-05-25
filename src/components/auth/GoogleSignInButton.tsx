import React from 'react';
import Button from '../common/Button';
import { GoogleIcon } from '../common/Icons';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { getGoogleClientId } from '../../lib/googleAuth';

interface GoogleSignInButtonProps {
  label?: string;
  disabled?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  label = 'Sign in with Google',
  disabled = false,
}) => {
  const { handleGoogleSignIn, isGoogleLoading } = useGoogleAuth();
  const isConfigured = !!getGoogleClientId();

  return (
    <Button
      variant="social"
      type="button"
      className="min-w-0"
      onClick={handleGoogleSignIn}
      disabled={disabled || isGoogleLoading || !isConfigured}
      isLoading={isGoogleLoading}
    >
      <GoogleIcon />
      <span className="truncate">{label}</span>
    </Button>
  );
};

export default GoogleSignInButton;
