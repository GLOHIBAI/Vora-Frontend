import { useCallback, useEffect, useState } from 'react';

type BlockBrowserAutofillOptions = {
  /** Use on password fields — Chrome ignores "off" but respects "new-password". */
  forPassword?: boolean;
};

/**
 * Stops browsers from pre-filling saved credentials on mount.
 * `autoComplete="off"` alone is often ignored for email/password fields.
 */
export function useBlockBrowserAutofill(
  onClear?: () => void,
  options: BlockBrowserAutofillOptions = {},
) {
  const [locked, setLocked] = useState(true);

  const unlock = useCallback(() => setLocked(false), []);

  useEffect(() => {
    onClear?.();
    const timeouts = [0, 50, 150, 350].map((ms) =>
      window.setTimeout(() => onClear?.(), ms),
    );
    return () => timeouts.forEach((id) => window.clearTimeout(id));
  }, [onClear]);

  return {
    readOnly: locked,
    onFocus: unlock,
    autoComplete: options.forPassword ? ('new-password' as const) : ('off' as const),
    className: 'vora-block-autofill',
    'data-lpignore': 'true' as const,
    'data-1p-ignore': 'true' as const,
    'data-form-type': 'other' as const,
  };
}
