/* motion-primitives — InfiniteSlider
 *
 * Copied in as a shadcn-style local component: we own this file and edit it
 * freely, there is no upstream to re-sync with.
 *
 * Deviations from the published source:
 *   - the 'use client' directive is dropped. It is a Next.js App Router marker
 *     with no meaning under Vite, and Rollup warns on module-level directives
 *     it cannot hoist.
 *   - `controls` is typed rather than left as an implicit any.
 *   - remaining props forward to the outer element, so callers can set
 *     aria-hidden, id, data-* and so on. The published type accepted className
 *     only, which left no way to keep a duplicated track out of the a11y tree.
 *   - the number of copies is derived from the viewport instead of fixed at 2.
 *     See below — with two copies the loop is only seamless when one copy is
 *     wider than the visible area.
 *
 * The geometry
 * ------------
 * With k copies of n children at `gap` spacing, the track measures
 *   W = k·sum(children) + (k·n − 1)·gap
 * so one copy plus its trailing gap — the exact distance that lands copy 2
 * where copy 1 began, i.e. the travel per lap — is
 *   U = (W + gap) / k
 *
 * The published component fixes k = 2 and travels W/2 + gap/2, which is that
 * same U. The loop point is right, but it says nothing about whether there is
 * still content on screen when you get there. At the end of a lap the track
 * only covers
 *   W − U = (k − 1)·U − gap
 * pixels of the viewport. With k = 2 that is one copy, so anything wider than a
 * single copy of the children shows a growing empty tail that snaps full at the
 * reset — very visible with a handful of small logos on a wide window.
 *
 * So k is solved for instead: to cover a viewport V we need
 *   (k − 1)·U − gap ≥ V   ⟹   k ≥ (V + gap)/U + 1
 *
 * U is measured off a single copy, never off the whole track. Deriving it from
 * the track as (W + gap)/k is algebraically identical but creates a feedback
 * loop: k changes a render before ResizeObserver reports the new W, so for one
 * frame a stale (small) W is divided by the new (large) k, U collapses, and the
 * k it implies is larger still. That runs away and locks the page up. Measuring
 * one copy keeps U independent of k, so there is no loop to converge.
 */
import { cn } from '@/lib/utils';
import {
  useMotionValue,
  animate,
  motion,
  type AnimationPlaybackControls,
} from 'framer-motion';
import { useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';

type InfiniteSliderProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
  ...props
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [viewportRef, viewport] = useMeasure();
  const [copyRef, copy] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const [copies, setCopies] = useState(2);

  const horizontal = direction === 'horizontal';
  const viewportSize = horizontal ? viewport.width : viewport.height;
  const copySize = horizontal ? copy.width : copy.height;

  // One copy plus its trailing gap: the travel per lap. Measured off a single
  // copy, so it does not move when `copies` does — see the note in the header.
  const lap = copySize > 0 ? copySize + gap : 0;

  useEffect(() => {
    if (lap <= 0 || viewportSize <= 0) return;
    const needed = Math.max(2, Math.ceil((viewportSize + gap) / lap) + 1);
    if (needed !== copies) setCopies(needed);
  }, [lap, viewportSize, gap, copies]);

  useEffect(() => {
    let controls: AnimationPlaybackControls | undefined;
    const from = reverse ? -lap : 0;
    const to = reverse ? 0 : -lap;

    if (isTransitioning) {
      // Speed just changed. Finish the current lap from wherever the track sits,
      // pro-rating the remaining time, then hand back to the looping branch.
      // Pro-rate against the lap, not the whole track — dividing by the track
      // width would run this leg k times too fast.
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration: lap
          ? currentDuration * Math.abs((translation.get() - to) / lap)
          : 0,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: currentDuration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return controls?.stop;
  }, [key, translation, currentDuration, lap, isTransitioning, reverse]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentDuration(durationOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentDuration(duration);
        },
      }
    : {};

  return (
    <div
      ref={viewportRef}
      className={cn('overflow-hidden', className)}
      {...props}
    >
      <motion.div
        className='flex w-max'
        style={{
          ...(horizontal ? { x: translation } : { y: translation }),
          gap: `${gap}px`,
          flexDirection: horizontal ? 'row' : 'column',
        }}
        {...hoverProps}
      >
        {Array.from({ length: copies }, (_, index) => (
          <div
            key={index}
            // Only copy 0 is measured; the rest are identical by construction.
            ref={index === 0 ? copyRef : undefined}
            className='flex shrink-0'
            style={{
              gap: `${gap}px`,
              flexDirection: horizontal ? 'row' : 'column',
            }}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
