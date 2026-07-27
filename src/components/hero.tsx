import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionTabs, type PanelId } from '@/components/section-tabs';
import { buildHeroCollapse } from '@/components/hero-collapse';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/use-media-query';
import { asset } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Which of the two hero designs is live.
 *
 *  `true` — the portrait holds. It is pinned for the hero's whole height, so it
 *  sits still at the top of the window while the copy rises off it and the page
 *  below slides up and covers it. The picture is never cut into by the top of
 *  the window, because it never reaches it.
 *
 *  `false` — the original. The portrait scrolls away with the hero and is
 *  cropped by the top of the window on the way out.
 *
 *  Flipping this const is the whole revert: the markup and the stylesheet are
 *  the same in both designs (`main` is opaque either way, which is what the
 *  portrait is covered by, and it is the same black that was showing through
 *  it before). The collapse — the drift, the zoom, the fade — is untouched and
 *  runs in both. */
const PORTRAIT_HOLDS = true;

type HeroProps = {
  activePanel: PanelId;
  onPanelChange: (id: PanelId) => void;
  /** Raised when the pill parks in the bar, which is what brings the bar's own
   *  chrome in. The hero owns the moment; the bar only reacts to it. */
  onDockChange: (docked: boolean) => void;
  /** Raised well before that, while the pill is still climbing towards the bar.
   *  The phone layout has no room for the pill and the two chips at once, and
   *  the chips have to be gone by the time it arrives, not as it lands. */
  onNearChange: (near: boolean) => void;
};

export function Hero({
  activePanel,
  onPanelChange,
  onDockChange,
  onNearChange,
}: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  /** The portrait and the three gradients over it, as one box — so that holding
   *  the picture still is one pinned element and not four that have to agree. */
  const backdropRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  /** Never animated — it is the dock trigger, and a trigger that moves is a
   *  trigger whose start position drifts on every refresh. */
  const tabsSlotRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  /** The phone layout stacks the intro under the name, which changes how the
   *  two of them leave. Same breakpoint as the stylesheet. */
  const isPhone = useMediaQuery('(max-width: 780px)');

  useGSAP(
    () => {
      // The dock itself is layout, not decoration: it happens either way, so
      // the navigation is still there for someone who asked for less motion.
      //
      // Crossings only, never `isActive`. Any end at all has a far side, and
      // hitting the bottom of a long panel means crossing it: with end:'max'
      // the bar undocked the moment the page bottomed out. onEnter/onLeaveBack
      // are the two events that actually mean "the hero's tabs went under the
      // bar" and "they came back"; onLeave has nothing to say here.
      const dock = ScrollTrigger.create({
        trigger: tabsSlotRef.current,
        // Where the pill parks: vertically centred in the collapsed bar.
        start: 'top 7px',
        // Never ends. pinSpacing is off, so a pin longer than the document
        // costs nothing and there is no far side to fall off — which is what
        // used to undock the bar at the bottom of the Projects panel.
        end: '+=99999',
        // The pill scrolls up with the hero and stops here. One element the
        // whole way, so there is nothing to hand over and nothing to jump:
        // the same behaviour the two chips get from being fixed.
        pin: tabsRef.current,
        pinSpacing: false,
        onEnter: () => onDockChange(true),
        onLeaveBack: () => onDockChange(false),
        // Fires on creation and after every refresh, so a reload part-way down
        // the page — and a resize that moves the start — both land correctly.
        onRefresh: (self) => onDockChange(self.scroll() >= self.start),
      });
      onDockChange(dock.scroll() >= dock.start);

      // Same trigger element, a much earlier line. The pill travels the last
      // ~200px into the bar under its own steam, and on a phone it crosses the
      // chips on the way: they have to have finished fading before it gets
      // there. Only the phone breakpoint acts on this — see .topbar__chip.
      const near = ScrollTrigger.create({
        trigger: tabsSlotRef.current,
        start: 'top 240px',
        end: '+=99999',
        onEnter: () => onNearChange(true),
        onLeaveBack: () => onNearChange(false),
        onRefresh: (self) => onNearChange(self.scroll() >= self.start),
      });
      onNearChange(near.scroll() >= near.start);

      // Holding the picture. Pinned across the hero's own height, which is the
      // exact stretch over which the page below has to cover it: the pin is
      // released the moment the hero's last pixel leaves the top of the window,
      // by which point the backdrop has nothing on screen left to hold.
      // pinSpacing off — the backdrop is out of flow, so pinning it must not
      // add height to anything, and there is nothing under it to push down.
      // Not gated on reduceMotion: this is where the picture is, not an
      // animation of it. The drift and the fade over it are the part that stops.
      if (PORTRAIT_HOLDS) {
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          pin: backdropRef.current,
          pinSpacing: false,
          // The pin starts at scroll 0, where a flick of the wheel can outrun
          // the switch to fixed and tear the picture for a frame.
          anticipatePin: 1,
        });
      }

      if (reduceMotion) return;

      // The collapse. Scrubbed across the hero's own height, so the grid comes
      // apart at exactly the rate it is being scrolled away.
      const collapse = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.4,
        },
      });

      buildHeroCollapse(
        {
          portrait: portraitRef.current,
          intro: introRef.current,
          name: nameRef.current,
        },
        collapse,
        isPhone,
      );
    },
    // revertOnUpdate: a motion-preference flip has to tear the old trigger and
    // timeline down, not stack a second set on top of them.
    {
      scope: rootRef,
      dependencies: [reduceMotion, isPhone, onDockChange, onNearChange],
      revertOnUpdate: true,
    },
  );

  return (
    <header className='hero' ref={rootRef}>
      {/* One box for the picture and everything that shades it: the vignette
          that dissolves its edges and the two fades that protect the bar and
          hand the picture over to the page. They have to travel together —
          holding the portrait still while its own vignette scrolled off it
          would strip the picture bare. Geometrically this wrapper is the box
          the four of them already shared, so it changes nothing on its own. */}
      <div className='hero__backdrop' ref={backdropRef} aria-hidden='true'>
        <div className='hero__media'>
          <img
            ref={portraitRef}
            src={asset('/assets/img/brand/portrait.jpg')}
            alt=''
            decoding='async'
            fetchPriority='high'
          />
        </div>
        <div className='hero__vignette' />
        <div className='hero__fade hero__fade--top' />
        <div className='hero__fade hero__fade--bottom' />
      </div>

      <div className='hero__inner'>
        <div className='hero__intro' ref={introRef}>
          <div className='hero__intro-left'>
            <span className='rule' aria-hidden='true' />
            <p className='hero__role'>
              Agentic AI / Generative AI
              <br />
              Engineer &amp; Consultant
            </p>
          </div>
          <div className='hero__intro-right'>
            <p className='hero__pitch'>
              I design and build multi-agent workflows and LLM orchestration to
              take AI from proof-of-concept to full-scale production.
            </p>
          </div>
        </div>

        <div className='hero__name' ref={nameRef}>
          <h1 className='name'>Julien</h1>
          <p className='surname'>CHÉMERY</p>
        </div>
      </div>

      {/* Outside .hero__inner on purpose. That column is a stacking context
          (z-index 2), which would cap the pill below the bar's chrome once it
          parks on top of it — and it is faded out by the collapse, which the
          pill must survive. .hero__inner reserves the space it used to take. */}
      <div className='hero__tabs' ref={tabsSlotRef}>
        <div className='hero__tabs-pill' ref={tabsRef}>
          <SectionTabs active={activePanel} onChange={onPanelChange} />
        </div>
      </div>
    </header>
  );
}
