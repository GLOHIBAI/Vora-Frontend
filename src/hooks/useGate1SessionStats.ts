import { useMemo } from 'react';
import { useGate1ResumePresentation } from './useGate1ResumePresentation';

const formatMinuteRange = (total: number, fallback: string): string => {
  if (total <= 0) return fallback;
  const low = Math.max(5, Math.floor(total * 0.85));
  const high = Math.ceil(total * 1.15);
  return `${low}-${high}`;
};

export const useGate1SessionStats = (session: 1 | 2, roleSlug: string) => {
  const { resumeState, catalog } = useGate1ResumePresentation(roleSlug);

  return useMemo(() => {
    const screenKeys =
      session === 1
        ? resumeState?.session1Screens ?? []
        : resumeState?.session2Screens ?? [];

    const sessionLabel =
      session === 1
        ? resumeState?.session === 1
          ? resumeState.sessionLabel
          : 'How you think'
        : resumeState?.session === 2
          ? resumeState.sessionLabel
          : 'Your instincts';

    const estimatedMinutes = catalog
      .filter((entry) => (screenKeys as readonly string[]).includes(entry.screenKey))
      .reduce((sum, entry) => sum + (entry.estimatedMinutes ?? 0), 0);

    return {
      sessionLabel,
      screenCount: screenKeys.length || (session === 1 ? 6 : 5),
      minuteRange:
        session === 1
          ? formatMinuteRange(estimatedMinutes, '15-25')
          : formatMinuteRange(estimatedMinutes, '12-18'),
      sessionComplete: session === 1
        ? (resumeState?.completedScreenKeys.filter((k) =>
            resumeState.session1Screens.includes(k as never),
          ).length ?? 0) >= screenKeys.length
        : false,
    };
  }, [session, resumeState, catalog]);
};
