import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useGoogleLoginMutation } from '../services/queries/auth';
import { signInWithGoogle } from '../lib/googleAuth';
import { resolveOAuthNavigation } from '../utils/oauth';

export function useGoogleAuth() {
  const navigate = useNavigate();
  const { login, setSetupToken } = useAuth();
  const googleMutation = useGoogleLoginMutation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const response = await googleMutation.mutateAsync({ idToken });
      const { route, state } = resolveOAuthNavigation(response.data, login, setSetupToken);

      if (response.data.accessToken) {
        toast.success('Welcome to VORA!');
      }

      navigate(route, { state });
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      const message = err?.message || 'Google sign-in failed. Please try again.';

      if (err?.status === 409 || message.toLowerCase().includes('email login')) {
        toast.error('This email is registered with a password. Please log in with email instead.');
        navigate('/login');
        return;
      }

      if (!message.includes('popup') && !message.includes('closed')) {
        toast.error(message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [googleMutation, login, navigate, setSetupToken]);

  return {
    handleGoogleSignIn,
    isGoogleLoading: isGoogleLoading || googleMutation.isPending,
  };
}
