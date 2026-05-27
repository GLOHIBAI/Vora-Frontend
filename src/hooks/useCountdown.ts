import { useEffect, useMemo, useState } from 'react';

export interface CountdownParts {
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  progressPercent: number;
  isComplete: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export const formatCountdownParts = (parts: CountdownParts) => ({
  hours: pad2(parts.hours),
  minutes: pad2(parts.minutes),
  seconds: pad2(parts.seconds),
});

/**
 * Counts down to `endAt`. `startAt` is used for progress (defaults to submitted time or now - duration).
 */
export function useCountdown(endAt: Date, startAt?: Date): CountdownParts {
  const start = useMemo(
    () => startAt ?? new Date(endAt.getTime() - 48 * 60 * 60 * 1000),
    [endAt, startAt]
  );

  const compute = (): CountdownParts => {
    const now = Date.now();
    const endMs = endAt.getTime();
    const startMs = start.getTime();
    const totalDuration = Math.max(1, endMs - startMs);
    const remaining = Math.max(0, Math.floor((endMs - now) / 1000));
    const elapsed = Math.min(totalDuration, totalDuration - remaining * 1000);
    const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);

    if (remaining <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSecondsRemaining: 0,
        progressPercent: 100,
        isComplete: true,
      };
    }

    return {
      hours: Math.floor(remaining / 3600),
      minutes: Math.floor((remaining % 3600) / 60),
      seconds: remaining % 60,
      totalSecondsRemaining: remaining,
      progressPercent,
      isComplete: false,
    };
  };

  const [parts, setParts] = useState<CountdownParts>(compute);

  useEffect(() => {
    setParts(compute());
    const id = window.setInterval(() => setParts(compute()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt.getTime(), start.getTime()]);

  return parts;
}
