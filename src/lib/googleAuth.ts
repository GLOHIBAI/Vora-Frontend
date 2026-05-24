const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let scriptLoadPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In')));
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function getGoogleClientId(): string | undefined {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
}

export async function signInWithGoogle(): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.');
  }

  await loadGoogleScript();

  if (!window.google?.accounts?.id) {
    throw new Error('Google Sign-In failed to initialize.');
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let container: HTMLDivElement | null = null;
    let focusListener: (() => void) | null = null;
    let timeoutId: ReturnType<typeof window.setTimeout> | null = null;

    const cleanup = () => {
      if (focusListener) {
        window.removeEventListener('focus', focusListener);
        focusListener = null;
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (container?.parentNode) {
        document.body.removeChild(container);
        container = null;
      }
    };

    const settle = (action: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      action();
    };

    // When the user closes the Google popup, focus returns here without a credential.
    const attachPopupCloseListener = () => {
      focusListener = () => {
        window.setTimeout(() => {
          if (!settled) {
            settle(() => reject(new Error('Sign-in was cancelled.')));
          }
        }, 400);
      };
      window.addEventListener('focus', focusListener);
    };

    window.setTimeout(attachPopupCloseListener, 600);

    timeoutId = window.setTimeout(() => {
      if (!settled) {
        settle(() => reject(new Error('Sign-in timed out. Please try again.')));
      }
    }, 120_000);

    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        settle(() => {
          if (response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('No credential received from Google.'));
          }
        });
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
    document.body.appendChild(container);

    window.google!.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
    });

    const clickGoogleButton = () => {
      const btn =
        container?.querySelector('[role="button"]') ??
        container?.querySelector('div[tabindex="0"]');
      if (btn instanceof HTMLElement) {
        btn.click();
        return true;
      }
      return false;
    };

    if (!clickGoogleButton()) {
      window.setTimeout(() => {
        if (!clickGoogleButton() && !settled) {
          settle(() => reject(new Error('Could not open Google Sign-In.')));
        }
      }, 150);
    }
  });
}
