import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // If it's a dynamic module fetch error (e.g. Vite chunk reload or connection blip)
    if (
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk')
    ) {
      const storageKey = 'chunk_reload_timestamp';
      const lastReload = sessionStorage.getItem(storageKey);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 bg-blue-50 text-[#0047CC] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <span className="text-xl font-bold">!</span>
          </div>
          <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-[13px] text-gray-500 max-w-md mb-5">
            A module failed to load or an unexpected error occurred. Please refresh the page to continue.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#0047CC] hover:bg-[#003cb0] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs"
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
