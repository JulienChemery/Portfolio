/* 21st.dev — AnimatedTabs
 *
 * Copied in as a shadcn-style local component: we own this file and edit it
 * freely, there is no upstream to re-sync with.
 *
 * The idea is the published one and it is a good one. Two identical rows of
 * labels are stacked: the lower row is muted, the upper row sits on a solid
 * light bar, and a clip-path reveals exactly the width of the active label.
 * Transitioning the clip-path slides the highlight from one label to the next
 * with the text on it, so the letters flip colour as the bar passes over them.
 * No layout animation, no absolutely positioned pill to keep in sync.
 *
 * Deviations from the published source:
 *   - the 'use client' directive is dropped — a Next.js App Router marker with
 *     no meaning under Vite (see ui/infinite-slider.tsx for the same note).
 *   - controlled, not self-stateful. The page owns which panel is open (deep
 *     links, "See my work"), and this renders in two places at once — the hero
 *     and the top bar — which have to agree.
 *   - full APG tab semantics: role=tablist/tab, aria-selected, aria-controls,
 *     one tab stop for the list, arrows move selection and focus together.
 *     The published version renders bare buttons.
 *   - the clip rectangle is measured off the live boxes rather than derived
 *     from offsetLeft plus a hard-coded padding constant. Same result when the
 *     padding happens to be 16px, right at any other value.
 *   - the slide is a GSAP tween, not a CSS transition. This copy lives inside
 *     the hero's pinned pill, and ScrollTrigger.refresh() — which App runs on
 *     every panel change, i.e. on every tab click — takes the pinned element
 *     out of its pin-spacer and puts it back. A DOM detach cancels running CSS
 *     transitions, so the highlight simply teleported. GSAP writes the value
 *     from JavaScript on each tick and does not care where the node lives.
 *   - styling comes from the portfolio's design system (.tabs / .tab in
 *     styles.css), not from Tailwind theme tokens this project does not define.
 */
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

gsap.registerPlugin(CustomEase);

/** The curve the CSS transition used, kept to the number:
 *  cubic-bezier(0.32, 0.72, 0, 1). */
const SLIDE_EASE = CustomEase.create('tabs-slide', 'M0,0 C0.32,0.72 0,1 1,1');
const SLIDE_DURATION = 0.26;

export type AnimatedTab = {
  id: string;
  label: string;
};

export type AnimatedTabsProps = {
  tabs: readonly AnimatedTab[];
  /** Id of the active tab. Controlled — see the note above. */
  value: string;
  onChange: (id: string) => void;
  /** Distinguishes the two mounted copies, so their DOM ids stay unique. */
  idPrefix?: string;
  /** Element the tab controls, `${panelPrefix}${tab.id}`. */
  panelPrefix?: string;
  label?: string;
  className?: string;
};

export function AnimatedTabs({
  tabs,
  value,
  onChange,
  idPrefix = 'tab-',
  panelPrefix = 'panel-',
  label,
  className,
}: AnimatedTabsProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRun = useRef(true);
  /** The highlight rectangle, as insets from the clip box's own edges. GSAP
   *  tweens this object and the clip-path is written from it, so it always
   *  holds where the highlight actually is — which is where a second click
   *  mid-slide retargets from, instead of restarting at the old tab. */
  const inset = useRef({ left: 0, right: 0 });
  /** Where the highlight is headed. Kept apart from `inset`, which is mid-slide
   *  most of the time and so cannot say whether a measurement is news. NaN
   *  until the first one, which therefore always is. */
  const goal = useRef({ left: NaN, right: NaN });
  const reduceMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const clip = clipRef.current;
    const active = activeRef.current;
    if (!clip || !active) return;

    const write = () => {
      const { left, right } = inset.current;
      clip.style.clipPath = `inset(0 ${right}px 0 ${left}px round 999px)`;
    };

    // Measured off the clip layer itself: it is the box clip-path insets are
    // resolved against, so the two can never drift apart.
    const measure = () => {
      const box = clip.getBoundingClientRect();
      const target = active.getBoundingClientRect();
      return { left: target.left - box.left, right: box.right - target.right };
    };

    const place = (animate: boolean) => {
      const next = measure();
      // Nothing has moved: an observation that only repeats where the highlight
      // is already going must not touch the slide that is running.
      if (
        Math.abs(next.left - goal.current.left) < 0.5 &&
        Math.abs(next.right - goal.current.right) < 0.5
      ) {
        return;
      }
      goal.current = next;

      if (!animate) {
        gsap.killTweensOf(inset.current);
        Object.assign(inset.current, next);
        write();
        return;
      }
      gsap.to(inset.current, {
        ...next,
        duration: SLIDE_DURATION,
        ease: SLIDE_EASE,
        overwrite: true,
        onUpdate: write,
      });
    };

    // Nothing to slide from on mount: the highlight is placed outright, or it
    // wipes in from the left edge on load.
    place(!firstRun.current && !reduceMotion);
    firstRun.current = false;

    // Labels move when the font lands or the layout reflows, and the highlight
    // has to follow. Cheap: two elements, no work unless a box actually changes
    // — and observe()'s own opening delivery, which lands in the middle of a
    // tab change, says nothing has, so the guard in place() drops it.
    const observer = new ResizeObserver(() => place(gsap.isTweening(inset.current)));
    observer.observe(clip);
    observer.observe(active);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(inset.current);
    };
  }, [value, tabs, reduceMotion]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    let next: number | null = null;

    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;

    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div className={cn('tabs', className)}>
      {/* The highlight. aria-hidden: it is the same labels a second time. */}
      <div className='tabs__clip' ref={clipRef} aria-hidden='true'>
        <div className='tabs__clip-row'>
          {tabs.map((tab) => (
            <span key={tab.id} className='tab tab--lit'>
              {tab.label}
            </span>
          ))}
        </div>
      </div>

      <div className='tabs__list' role='tablist' aria-label={label}>
        {tabs.map((tab, index) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                buttons.current[index] = node;
                if (selected) activeRef.current = node;
              }}
              className='tab'
              role='tab'
              id={`${idPrefix}${tab.id}`}
              aria-controls={`${panelPrefix}${tab.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              type='button'
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
