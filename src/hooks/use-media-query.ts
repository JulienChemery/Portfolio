import { useSyncExternalStore } from 'react';

/** Reactive `window.matchMedia`. Used where a value that CSS would express as a
 *  media query has to reach JavaScript instead — the slider takes its gap and
 *  speed as numbers, so the 780px breakpoint has to be readable from React. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    // Server snapshot: nothing renders on a server here, but useSyncExternalStore
    // wants the third argument and `false` is the safe default either way.
    () => false,
  );
}

export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)');
