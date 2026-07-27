import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';
import { asset, cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);

/** Hold, then cruise. A power ease is still accelerating when it arrives, which
 *  spends the whole middle of the scroll getting up to speed and then throws
 *  the last frames past you. This one holds the opening frame, is at full rate
 *  by a third of the way in, and keeps that rate flat to the end: the first
 *  quarter of the scroll buys 4% of the clip, everything after the halfway
 *  point runs at a steady 1.3x. */
const HOLD_THEN_CRUISE = CustomEase.create(
  'holdThenCruise',
  'M0,0 C0.35,0 0.6,0.5 1,1',
);

type ScrollVideoProps = {
  /** Public path to the clip. Must be encoded all-keyframe — see below. */
  src: string;
  /** First frame, as a still. Carries the figure until the clip is buffered,
   *  and is the whole picture for anyone who asked for reduced motion. */
  poster: string;
  /** Describes the clip, not the frame: it labels the <video> either way. */
  alt: string;
  className?: string;
  /** Source frame rate. currentTime is snapped to this grid, so a wrong value
   *  costs smoothness, not correctness. */
  fps?: number;
};

/** A clip scrubbed by the page scroll: the page keeps moving, and the clip
 *  plays through while the figure travels the viewport.
 *
 *  The clip has to be encoded with every frame a keyframe (`-g 1`), otherwise
 *  each seek decodes forward from the last keyframe and the scrub stutters.
 *  That trades file size for seek cost, which is the right way round here: the
 *  file is fetched once, the seeks happen sixty times a second. */
export function ScrollVideo({
  src,
  poster,
  alt,
  className,
  fps = 24,
}: ScrollVideoProps) {
  const figureRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const video = videoRef.current;
      const figure = figureRef.current;
      if (!video || !figure) return;

      // Belt and braces: React sets the property, but an unmuted video is
      // refused autoplay outright and prime() below depends on it.
      video.muted = true;

      // Reduced motion keeps the clip, drops the choreography: <video controls>
      // renders below, so it is watchable on purpose rather than by scrolling.
      if (reduceMotion) return;

      // Where the scroll has got to, 0 to 1. Held outside the tween so the
      // load handler below can catch up to it.
      const playhead = { progress: 0 };

      // One seek per source frame. Scroll resolution is far finer than 24fps,
      // and every redundant currentTime write is a decode the browser has to
      // service and then throw away.
      let lastFrame = -1;
      const seek = (progress: number) => {
        const { duration } = video;
        if (!duration) return; // metadata not in yet — the poster still holds
        const last = Math.round(duration * fps) - 1;
        const frame = gsap.utils.clamp(
          0,
          last,
          Math.round(progress * duration * fps),
        );
        if (frame === lastFrame) return;
        lastFrame = frame;
        // Half a frame in, so the seek lands inside the frame rather than on
        // the boundary between it and the one before.
        video.currentTime = (frame + 0.5) / fps;
      };

      // Two things, once the first frames are in.
      //
      // Safari will not paint a seek on a video it has never played, so a muted
      // play/pause primes the decoder — silent, instantaneous, and the catch
      // swallows the rejection where autoplay is refused anyway.
      //
      // Then it catches up. Loading only starts on approach, so a fast scroll
      // can reach the pin before the metadata does; every seek until then is a
      // no-op against a NaN duration. Without this the clip sits on its first
      // frame until the scroll moves again, which for someone who has stopped
      // reading mid-section is never.
      const prime = () => {
        void video
          .play()
          .catch(() => {})
          .finally(() => {
            video.pause();
            lastFrame = -1;
            seek(playhead.progress);
          });
      };
      video.addEventListener('loadeddata', prime, { once: true });

      // The clip is ~1.7 MB that nothing above the fold needs, so `preload` is
      // 'none' in the markup and is turned up one viewport-height before the
      // figure arrives. By the time it can be scrubbed it is buffered, and the
      // hero never had to share the connection with it.
      ScrollTrigger.create({
        trigger: figure,
        start: 'top bottom+=100%',
        onEnter: (self) => {
          video.preload = 'auto';
          video.load();
          self.kill();
        },
      });

      // One timeline per branch, a second long, so a position parameter reads
      // as a fraction of the scroll distance.
      //
      // Not linear: the clip barely moves over the first stretch of scroll. It
      // gives you a moment on the opening frame as the figure comes up the
      // screen — the scroll is answering, just quietly — and the assembly then
      // runs at pace instead of arriving at a crawl. What happens after the
      // hold is the ease's business, and the two branches want different
      // things of it.
      const drive = (ease: string | gsap.EaseFunction, vars: ScrollTrigger.Vars) =>
        gsap.timeline({ scrollTrigger: vars }).to(
          playhead,
          {
            progress: 1,
            ease,
            duration: 1,
            onUpdate: () => seek(playhead.progress),
          },
          0,
        );

      // Same shape at every width, and never a pin: the page keeps moving, the
      // clip is simply mapped onto the figure's own travel through the
      // viewport. Nothing is taken from the scroll, so the section reads like
      // the rest of the page rather than like a slide that has to be cleared.
      //
      // 960px is where styles.css stacks the feature into one column. Below it
      // the figure is a small square at the top of a very tall section and can
      // travel most of the way out before the last frame lands. Above it the
      // figure is 576px of a viewport barely more than half again as tall, so
      // it both finishes earlier in that travel and spends the scroll it has
      // differently — hence a different end and a different ease.
      //
      // scrub 0.3 in both: the clip trails the scroll by a few frames, which
      // reads as weight rather than as lag at 24fps.
      const mm = gsap.matchMedia();

      mm.add('(min-width: 961px)', () => {
        drive(HOLD_THEN_CRUISE, {
          trigger: figure,
          // The figure is two thirds of the viewport tall, so it only ever
          // travels about a viewport and a half in total and these two anchors
          // are spending the same budget: every pixel the start moves down the
          // page is a pixel the clip no longer has to play over. This window
          // is the late half of that travel — the scrub takes over once the
          // figure is properly on the page rather than while it is still a
          // strip at the fold, and holds the last frames back until it is
          // leaving. Both anchored to the figure's own box rather than to a
          // fraction of the viewport, so a shorter window loses scroll
          // distance instead of shifting where the clip lands.
          start: 'top 55%',
          end: 'top top-=60px',
          scrub: 0.3,
        });
      });

      mm.add('(max-width: 960px)', () => {
        drive('power1.in', {
          trigger: figure,
          start: 'top 85%',
          end: 'bottom 25%',
          scrub: 0.3,
        });
      });

      return () => {
        video.removeEventListener('loadeddata', prime);
        mm.revert();
      };
    },
    // revertOnUpdate: flipping the motion preference has to tear the pin down,
    // not leave it running underneath a second set of triggers.
    { scope: figureRef, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  return (
    <figure className={cn('media scroll-video', className)} ref={figureRef}>
      <video
        ref={videoRef}
        src={asset(src)}
        poster={asset(poster)}
        aria-label={alt}
        // Loaded on approach by the ScrollTrigger above, except under reduced
        // motion where the player is real and the user decides.
        preload={reduceMotion ? 'metadata' : 'none'}
        controls={reduceMotion}
        muted
        playsInline
        disablePictureInPicture
      />
    </figure>
  );
}
