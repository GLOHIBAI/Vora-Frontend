import { BASE_URL } from './index';

let refreshPromise: Promise<boolean> | null = null;

export async function singleFlightRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Crucial for cookie-based refresh
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json().catch(() => ({}));
      // If the backend returns a new token in JSON payload:
      const newToken = data?.accessToken || data?.data?.accessToken || data?.token || data?.data?.token;
      if (newToken) {
        localStorage.setItem('auth_token', newToken);
      }
      return true;
    } catch (error) {
      console.error('Token refresh request failed', error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
