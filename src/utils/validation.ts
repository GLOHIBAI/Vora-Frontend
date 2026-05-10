export const PERSONAL_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
  'icloud.com', 'aol.com', 'zoho.com', 'protonmail.com'
];

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates if an email is in the correct format.
 */
export const validateEmail = (email: string): string => {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  return '';
};

/**
 * Validates if an email is a work email (for Employers).
 */
export const validateWorkEmail = (email: string): string => {
  const basicError = validateEmail(email);
  if (basicError) return basicError;

  const domain = email.split('@')[1];
  if (PERSONAL_EMAIL_PROVIDERS.includes(domain?.toLowerCase())) {
    return 'Please use a work email address';
  }
  return '';
};

/**
 * Validates password strength/length.
 */
export const validatePassword = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  return '';
};

/**
 * Basic presence check for account type.
 */
export const validateAccountType = (accountType: string): string => {
  if (!accountType) return 'Please select an account type';
  return '';
};
export const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Validates if a URL/link is in the correct format.
 */
export const validatePortfolioUrl = (url: string): string => {
  if (!url) return ''; // Optional field usually
  if (!URL_REGEX.test(url)) return 'Please enter a valid portfolio or website link';
  return '';
};
