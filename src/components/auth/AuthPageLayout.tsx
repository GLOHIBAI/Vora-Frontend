import type { FormEventHandler, KeyboardEvent, MutableRefObject, ReactNode } from 'react';
import FullPageSpinner from '../common/FullPageSpinner';
import VoraLogo from '../common/VoraLogo';

export const authFooterLinkClass =
  'font-medium text-[#60A5FA] hover:text-[#2563EB] transition-colors duration-200';

type AuthPageShellProps = {
  children?: ReactNode;
  className?: string;
  centered?: boolean;
  loading?: boolean;
  heroContent?: ReactNode;
};

/** Full-viewport auth wrapper, supports split-screen video hero on desktop and clean mobile view. */
export function AuthPageShell({
  children,
  className = '',
  centered = true,
  loading = false,
  heroContent,
}: AuthPageShellProps) {
  if (loading) {
    return <FullPageSpinner />;
  }

  if (heroContent) {
    return (
      <div
        className={`${className.includes('h-') || className.includes('flex-1') ? '' : 'h-screen'} w-full overflow-hidden bg-white ${className}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Hero Video Showcase Area (Left on desktop - exactly 50% half of screen) */}
          <div className="hidden lg:block w-full h-full overflow-hidden bg-[#0A0F1D]">
            {heroContent}
          </div>

          {/* Form Area with safe auto-centering that prevents top-clipping (Right on desktop - exactly 50% half of screen) */}
          <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-10 xl:px-14">
            <div className="mx-auto my-auto w-full max-w-[460px] py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[100dvh] w-full overflow-x-hidden bg-white ${className}`}
    >
      <div
        className={`mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-12 lg:py-20 ${
          centered ? 'flex min-h-[100dvh] flex-col justify-center' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}

type AuthPageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  className?: string;
  showLogo?: boolean;
};

export function AuthPageHeader({ title, subtitle, className = '', showLogo = true }: AuthPageHeaderProps) {
  return (
    <div className={`mb-8 text-center sm:mb-10 lg:mb-12 ${className}`}>
      {showLogo && (
        <div className="flex justify-center mb-6">
          <VoraLogo size="lg" />
        </div>
      )}
      <h1 className="text-xl font-medium leading-tight tracking-[-0.01em] text-[#1C1C1C] sm:text-2xl sm:leading-[32px]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#6B7280] sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

type AuthFormCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthFormCard({ children, className = '' }: AuthFormCardProps) {
  return (
    <div className={`mx-auto w-full max-w-[480px] ${className}`}>{children}</div>
  );
}

/** Hidden fields that absorb browser password-manager autofill before real inputs. */
export function AuthDecoyAutofillFields() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -z-10 h-0 w-0 overflow-hidden opacity-0"
    >
      <input
        type="text"
        name="username"
        autoComplete="username"
        tabIndex={-1}
        defaultValue=""
      />
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        tabIndex={-1}
        defaultValue=""
      />
    </div>
  );
}

type AuthFormProps = {
  children: ReactNode;
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export function AuthForm({ children, className = '', onSubmit }: AuthFormProps) {
  return (
    <form
      className={`relative ${className}`}
      autoComplete="off"
      onSubmit={onSubmit}
      noValidate
    >
      <AuthDecoyAutofillFields />
      {children}
    </form>
  );
}

type AuthErrorBannerProps = {
  message: string;
};

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  return (
    <div className="mb-6 rounded-lg border border-red-100 bg-white p-4">
      <p className="text-center text-sm font-medium text-red-600 sm:text-left">
        {message}
      </p>
    </div>
  );
}

export function AuthSocialDivider() {
  return (
    <div className="flex items-center gap-3 py-2 sm:gap-4">
      <div className="h-px flex-1 bg-[#F3F4F6]" />
      <span className="shrink-0 text-xs font-medium text-[#6B7280]">OR</span>
      <div className="h-px flex-1 bg-[#F3F4F6]" />
    </div>
  );
}

type AuthSocialButtonsProps = {
  children: ReactNode;
};

export function AuthSocialButtons({ children }: AuthSocialButtonsProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-3 [&_button]:min-w-0">
      {children}
    </div>
  );
}

const OTP_INPUT_CLASS =
  'min-h-[44px] w-full min-w-0 rounded-xl border border-[#E5E7EB] bg-white text-center text-lg font-medium transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:min-h-[56px] sm:text-2xl';

type AuthOtpInputGridProps = {
  otp: string[];
  inputRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  onChange: (value: string, index: number) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>, index: number) => void;
};

export function AuthOtpInputGrid({
  otp,
  inputRefs,
  onChange,
  onKeyDown,
}: AuthOtpInputGridProps) {
  return (
    <div className="mx-auto grid w-full max-w-[22rem] grid-cols-6 gap-1.5 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(e.target.value, index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          aria-label={`Digit ${index + 1}`}
          className={OTP_INPUT_CLASS}
        />
      ))}
    </div>
  );
}
