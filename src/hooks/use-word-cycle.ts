import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

/** Rotates through `words` on an interval, holding at index 0 when the user has
 *  asked for reduced motion. Returns the index rather than the word so the
 *  caller can key its crossfade on it. */
export function useWordCycle(words: readonly string[], intervalMs = 2200) {
  const reduceMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setIndex(0);
      return;
    }
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, words.length, intervalMs]);

  return index;
}
