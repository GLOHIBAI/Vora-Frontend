import React from 'react';
import { singleFlightRefresh } from './refreshToken';
import { toast } from 'react-hot-toast';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.vora.com/v1';

export type AuthTokenMode = 'access' | 'setup' | 'none';

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  url: string;
  body?: any;
  /** @deprecated Use authToken instead */
  auth?: boolean;
  authToken?: AuthTokenMode;
  credentials?: RequestCredentials;
  /** Skip error toast (e.g. optional reads like onboarding state). */
  suppressErrorToast?: boolean;
}

function resolveAuthToken(mode: AuthTokenMode): string | null {
  if (mode === 'none') return null;
  if (mode === 'setup') {
    return localStorage.getItem('oauth_setup_token');
  }
  return localStorage.getItem('auth_token');
}

export type ApiError = {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
};

export const formatValidationError = (err: string): string => {
  if (typeof err !== 'string') return String(err);
  
  let clean = err;
  
  // Strip starting "property "
  clean = clean.replace(/^property\s+/i, '');

  // Handle references prefix
  if (clean.includes('references.0.')) {
    clean = clean.replace('references.0.', 'First Reference: ');
  } else if (clean.includes('references.1.')) {
    clean = clean.replace('references.1.', 'Second Reference: ');
  } else if (clean.match(/^references\.\d+\./i)) {
    clean = clean.replace(/^references\.(\d+)\./i, (_, idx) => `Reference ${Number(idx) + 1}: `);
  }

  // Clean field names (longest keys first to prevent partial replacing issues)
  clean = clean
    .replace(/roleOrganisation/gi, 'organization & role')
    .replace(/roleAndOrganisation/gi, 'organization & role')
    .replace(/confirmPassword/gi, 'confirm password')
    .replace(/verificationCode/gi, 'verification code')
    .replace(/yearsOfExperienceBand/gi, 'Years of Experience')
    .replace(/websiteOrPortfolioUrl/gi, 'Portfolio URL')
    .replace(/eligibilityIntPolicy/gi, 'international eligibility policy')
    .replace(/preferredWorkingStyle/gi, 'preferred working style')
    .replace(/communicationRhythm/gi, 'communication rhythm')
    .replace(/primaryLanguage/gi, 'primary language')
    .replace(/personalityTraits/gi, 'personality traits')
    .replace(/experienceYears/gi, 'years of experience')
    .replace(/experienceTypes/gi, 'experience types')
    .replace(/minQualification/gi, 'minimum qualification')
    .replace(/sectorBackground/gi, 'sector background')
    .replace(/uniStudentCount/gi, 'student cohort size')
    .replace(/conDuration/gi, 'contract duration')
    .replace(/stiDuration/gi, 'stipend duration')
    .replace(/durationPreset/gi, 'duration preset')
    .replace(/uniTuition/gi, 'tuition coverage')
    .replace(/uniProg/gi, 'program name')
    .replace(/firstName/gi, 'first name')
    .replace(/lastName/gi, 'last name')
    .replace(/fullName/gi, 'full name')
    .replace(/email/gi, 'email address')
    .replace(/phone/gi, 'phone number')
    .replace(/phoneNumber/gi, 'phone number')
    .replace(/relationship/gi, 'relationship')
    .replace(/type/gi, 'relationship type')
    .replace(/courseInterest/gi, 'Course Interest')
    .replace(/courseIntent/gi, 'Course Intent')
    .replace(/typeOfInterest/gi, 'Type of Interest')
    .replace(/preferredFormat/gi, 'Preferred Format')
    .replace(/roleTitle/gi, 'job title')
    .replace(/roleGoal/gi, 'role goal')
    .replace(/coreResponsibilities/gi, 'core responsibilities')
    .replace(/technicalSkills/gi, 'technical skills')
    .replace(/compType/gi, 'compensation type')
    .replace(/salMin/gi, 'minimum salary')
    .replace(/salMax/gi, 'maximum salary')
    .replace(/conMin/gi, 'minimum contract value')
    .replace(/conMax/gi, 'maximum contract value')
    .replace(/stiVal/gi, 'stipend value')
    .replace(/phdVal/gi, 'stipend value')
    .replace(/jdFile/gi, 'job description file')
    .replace(/goLiveDate/gi, 'go-live date');

  // Clean generic validation phrases
  clean = clean
    .replace(/must be an email/gi, 'must be a valid email address')
    .replace(/must be shorter than or equal to (\d+) characters/gi, 'must be $1 characters or less')
    .replace(/must be longer than or equal to (\d+) characters/gi, 'must be $1 characters or more')
    .replace(/should not be empty/gi, 'is required')
    .replace(/must not be empty/gi, 'is required')
    .replace(/must be a string/gi, 'must be text')
    .replace(/must be a number/gi, 'must be a number')
    .replace(/must be boolean/gi, 'must be yes/no')
    .replace(/must be one of the following values: line_manager, peer_or_community/gi, 'must be either Manager or Peer/Stakeholder')
    .replace(/should not exist/gi, 'is not allowed');

  // Capitalize first letter for proper presentation
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return clean;
};

export const getApiErrorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as ApiError).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

async function fetchWithInterceptors(options: ApiRequestOptions): Promise<any> {
  const {
    url,
    body,
    auth,
    authToken: authTokenOption,
    credentials: credentialsOption,
    suppressErrorToast = false,
    ...fetchOptions
  } = options;

  const authToken: AuthTokenMode =
    authTokenOption ?? (auth === false ? 'none' : 'access');

  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (authToken !== 'none') {
    const token = resolveAuthToken(authToken);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    (fetchOptions as RequestInit).credentials = credentialsOption ?? 'include';
  } else if (credentialsOption) {
    (fetchOptions as RequestInit).credentials = credentialsOption;
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  let reqBody = body;
  if (body && !(body instanceof FormData)) {
    reqBody = JSON.stringify(body);
  }

  let response = await fetch(fullUrl, {
    ...fetchOptions,
    headers,
    body: reqBody,
  });

  if (response.status === 401 && authToken === 'access') {
    // Attempt token refresh
    const refreshed = await singleFlightRefresh();
    if (refreshed) {
      // Retry original request with new token
      const newToken = localStorage.getItem('auth_token');
      if (newToken) headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        body: reqBody,
      });
    } else {
      // Refresh failed, trigger global logout
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  // Read response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Human-friendly error message extraction
    let cleanMessage = 'Something went wrong';
    if (data) {
      const errorList = data.data?.errors || data.errors;
      if (Array.isArray(errorList) && errorList.length > 0) {
        cleanMessage = errorList
          .map(err => {
            if (typeof err === 'string') {
              return formatValidationError(err);
            }
            return JSON.stringify(err);
          })
          .filter(Boolean)
          .join('\n');
      } else if (typeof data.message === 'string') {
        if (data.message.includes(', ')) {
          cleanMessage = data.message
            .split(', ')
            .map(err => formatValidationError(err))
            .filter(Boolean)
            .join('\n');
        } else {
          cleanMessage = formatValidationError(data.message);
        }
      }
    }

    const error: ApiError = {
      message: cleanMessage,
      status: response.status,
      errors: data?.errors || data,
    };
    
    if (response.status !== 401 && !suppressErrorToast) {
      const messageLines = cleanMessage.split('\n');
      toast.error(
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' } },
          messageLines.map((line, idx) =>
            React.createElement(
              'div',
              { key: idx, style: { fontSize: '13px', lineHeight: '1.4', fontWeight: 500 } },
              line
            )
          )
        ),
        {
          duration: 6000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #ecc9c9',
            padding: '12px 16px',
            maxWidth: '450px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }
        }
      );
    }
    
    throw error;
  }

  // Returns the exact JSON body, mirroring axios `res.data` conceptually as requested
  return data;
}

export const apiClient = {
  get: <T = any>(options: Omit<ApiRequestOptions, 'body'>): Promise<T> => {
    return fetchWithInterceptors({ ...options, method: 'GET' });
  },
  post: <T = any>(options: ApiRequestOptions): Promise<T> => {
    return fetchWithInterceptors({ ...options, method: 'POST' });
  },
  put: <T = any>(options: ApiRequestOptions): Promise<T> => {
    return fetchWithInterceptors({ ...options, method: 'PUT' });
  },
  patch: <T = any>(options: ApiRequestOptions): Promise<T> => {
    return fetchWithInterceptors({ ...options, method: 'PATCH' });
  },
  delete: <T = any>(options: ApiRequestOptions): Promise<T> => {
    return fetchWithInterceptors({ ...options, method: 'DELETE' });
  },
};
