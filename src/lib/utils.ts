import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn's standard class combiner: conditional classes via clsx, then
 *  tailwind-merge to drop earlier utilities that a later one overrides. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Prefix a public/ path with the deploy base, so `/assets/…` still resolves
 *  when the site is served from a subpath (GitHub Pages project repo).
 *  Img and Media call this for you; use it directly for anything else. */
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
