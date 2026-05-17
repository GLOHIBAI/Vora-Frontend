import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { authKeys } from "./keys";
import type {
  LoginRequest,
  SignupRequest,
  VerifyOTPRequest,
  AuthResponse,
  OAuthAuthResponse,
  User,
  GoogleLoginRequest,
  OAuthSelectRoleRequest,
  OAuthVerifyEmailRequest,
  OAuthStatusResponse,
  ApiResponse,
} from "./types";
import { useAuth } from "../../../context/AuthContext";
import { startTokenRefreshSchedule } from "../../api/scheduleRefreshToken";
import { toast } from "react-hot-toast";
import {
  completeOAuthSession,
  mapApiUserToContextUser,
  getSetupToken,
} from "../../../utils/oauth";

export const useLoginMutation = () => {
  const { login } = useAuth();

  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (data: LoginRequest) =>
      apiClient.post<AuthResponse>({
        url: "/auth/login",
        body: data,
        auth: false,
        credentials: "include",
      }),
    onSuccess: (response) => {
      const authData = response.data;
      const user = authData.user;

      login(mapApiUserToContextUser(user), authData.accessToken);

      toast.success("Welcome back to VORA!");
      startTokenRefreshSchedule();
    },
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationKey: authKeys.signup(),
    mutationFn: (data: SignupRequest) =>
      apiClient.post<ApiResponse<any>>({
        url: "/auth/register",
        body: data,
        auth: false,
      }),
    onSuccess: () => {
      toast.success("Registration successful! Please verify your email.");
    },
  });
};

export const useVerifyOTPMutation = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authKeys.verifyOTP(),
    mutationFn: (data: VerifyOTPRequest) =>
      apiClient.post<AuthResponse>({
        url: "/auth/verify-email",
        body: data,
        auth: false,
        credentials: "include",
      }),
    onSuccess: (response) => {
      const authData = response.data;
      login(mapApiUserToContextUser(authData.user), authData.accessToken);

      toast.success("Email verified successfully!");
      startTokenRefreshSchedule();
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
};

export const useGetCurrentUser = (options = {}) => {
  const { isAuthenticated, logout, updateUser } = useAuth();

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<User>>({
          url: "/auth/me",
        });
        const user = response.data;
        updateUser({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
        return user;
      } catch (err: unknown) {
        const error = err as { status?: number };
        if (error.status === 401) {
          logout();
        }
        throw err;
      }
    },
    enabled: isAuthenticated,
    retry: false,
    ...options,
  });
};

export const useGoogleLoginMutation = () => {
  return useMutation({
    mutationKey: authKeys.googleLogin(),
    mutationFn: (data: GoogleLoginRequest) =>
      apiClient.post<OAuthAuthResponse>({
        url: "/auth/google",
        body: data,
        auth: false,
        credentials: "include",
      }),
  });
};

export const useOAuthSelectRoleMutation = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authKeys.oauthSelectRole(),
    mutationFn: (data: OAuthSelectRoleRequest) =>
      apiClient.post<OAuthAuthResponse>({
        url: "/auth/oauth/select-role",
        body: data,
        authToken: "setup",
      }),
    onSuccess: (response) => {
      const authData = response.data;
      if (authData.accessToken) {
        completeOAuthSession(authData, login);
        startTokenRefreshSchedule();
      }
      toast.success("Role configured successfully!");
      queryClient.invalidateQueries({ queryKey: authKeys.oauthStatus() });
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
};

/** OAuth OTP verify — work/custom domain Google emails only (Gmail skips this step). */
export const useOAuthVerifyMutation = () => {
  const { setSetupToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authKeys.oauthVerify(),
    mutationFn: (data: OAuthVerifyEmailRequest) =>
      apiClient.post<OAuthAuthResponse>({
        url: "/auth/oauth/verify",
        body: data,
        authToken: "setup",
      }),
    onSuccess: (response) => {
      if (response.data.setupToken) {
        setSetupToken(response.data.setupToken);
      }
      toast.success("Email verified successfully!");
      queryClient.invalidateQueries({ queryKey: authKeys.oauthStatus() });
    },
  });
};

/** @deprecated Use useOAuthVerifyMutation */
export const useOAuthVerifyEmailMutation = useOAuthVerifyMutation;

export const useOAuthResendOtpMutation = () => {
  return useMutation({
    mutationKey: authKeys.oauthResendOtp(),
    mutationFn: () =>
      apiClient.post({
        url: "/auth/oauth/resend-otp",
        authToken: "setup",
      }),
    onSuccess: () => {
      toast.success("Verification code resent successfully!");
    },
  });
};

export const useResendOTPMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      apiClient.post({ url: "/auth/resend-verification", body: data, auth: false }),
    onSuccess: () => {
      toast.success("Verification code resent successfully!");
    },
  });
};

export const useGetOAuthStatus = (options = {}) => {
  const { hasSetupToken } = useAuth();

  return useQuery({
    queryKey: authKeys.oauthStatus(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<OAuthStatusResponse>>({
        url: "/auth/oauth/status",
        authToken: "setup",
      });
      return response.data;
    },
    enabled: hasSetupToken || !!getSetupToken(),
    ...options,
  });
};
