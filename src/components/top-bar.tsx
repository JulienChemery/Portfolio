import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

type TopBarProps = {
  /** True once the hero's tab pill has parked in the bar. */
  docked: boolean;
  /** True well before that, while the pill is still climbing. Only the phone
   *  layout acts on it: it is what clears the chips out of the pill's path. */
  near: boolean;
  onSeeWork: () => void;
};

/** The permanent bar. It is fixed from the first pixel of the page, where it
 *  reads as the hero's own nav row: no chrome, just the two chips over the
 *  portrait. Once the hero has scrolled away it takes on a background and
 *  becomes the site's only navigation.
 *
 *  The section tabs are not in here. They are the hero's, pinned by
 *  ScrollTrigger so they come to rest between these two chips — one element
 *  that stops, rather than two that trade places. See hero.tsx. */
export function TopBar({ docked, near, onSeeWork }: TopBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const to = docked ? 1 : 0;

      if (reduceMotion) {
        gsap.set(chromeRef.current, { opacity: to });
        return;
      }

      // The surface arrives under the pill just as the pill stops. Arriving is
      // the deliberate half and takes longer; leaving gets out of the way.
      // overwrite because scrubbing back and forth across the threshold
      // retargets this mid-flight — without it both directions run at once and
      // the bar flickers.
      gsap.to(chromeRef.current, {
        opacity: to,
        duration: docked ? 0.3 : 0.22,
        ease: 'power2.out',
        overwrite: true,
      });
    },
    { dependencies: [docked, reduceMotion], scope: rootRef },
  );

  return (
    <div
      className={cn('topbar', docked && 'is-docked', near && 'is-near')}
      ref={rootRef}
      // Not a <nav>: the tabs inside are a tablist, and the chips are the same
      // two links the hero has always had. One landmark is enough.
      aria-label='Primary'
      role='navigation'
    >
      <div className='topbar__chrome' ref={chromeRef} aria-hidden='true' />

      <a className='chip topbar__chip' href='#work' onClick={onSeeWork}>
        See my work
      </a>

      <a className='chip topbar__chip' href='#contact'>
        Get in touch
      </a>
    </div>
  );
}
