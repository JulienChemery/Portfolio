// gsap.core.Timeline below is the ambient namespace from gsap's own types, not
// a value — importing gsap here would shadow it and break the annotation.

type Targets = {
  portrait: Element | null;
  intro: Element | null;
  name: Element | null;
};

/** Fills a scrubbed timeline that runs across the hero's own height, so the
 *  grid comes apart at exactly the rate it is scrolled away. */
export function buildHeroCollapse(
  { portrait, intro, name }: Targets,
  tl: gsap.core.Timeline,
  /** The phone layout stacks the intro directly under the name, close enough
   *  that any exit of its own reads as the two of them coming apart. There they
   *  leave as one block instead — see below. */
  phone = false,
) {
  // The portrait does not leave with the page: it sinks back. A slow drift
  // downward, against the scroll, is what reads as depth — the scale is
  // there to pay for it. At any point the zoom overhangs the frame by 5% of
  // its height and the drift has used 4%, so the top edge is never exposed.
  tl.to(portrait, { yPercent: 4, scale: 1.1, opacity: 0.12, ease: 'none', duration: 1 }, 0);

  if (phone) {
    // One tween over both, so they hold their spacing the whole way out: the
    // name's exit, applied to the pair. Two tweens with different timings would
    // pull them apart or push them together, which at this distance is the
    // whole gesture. Filtered because gsap warns on a null in a target list.
    tl.to(
      [name, intro].filter(Boolean),
      { opacity: 0, y: -40, scale: 0.965, ease: 'none', duration: 0.6 },
      0.2,
    );
    return;
  }

  tl
    // The copy goes first and is gone well before the image is, so the frame
    // empties in a readable order instead of everything dissolving at once.
    // Order comes from the positions and durations, never from an ease: this is
    // scrubbed, so a curve here would make the copy slip against the wheel.
    .to(intro, { opacity: 0, y: -64, ease: 'none', duration: 0.55 }, 0)
    // The name is last, and shrinks as it lifts: away from you, toward the bar.
    .to(name, { opacity: 0, y: -40, scale: 0.965, ease: 'none', duration: 0.6 }, 0.2);
}
