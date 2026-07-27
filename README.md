# Julien Chémery — Portfolio

Implementation of **Portfolio v4 Sober Dark** from the Claude Design project
*AI Engineering Portfolio Design*. Vite + React + TypeScript, with Tailwind
alongside the project's own stylesheet and shadcn's component conventions.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, then bundle to dist/
npm run preview    # serve dist/
npm run typecheck
```

## Structure

```
index.html                      Vite entry — <head>, the skip link, #root
components.json                 shadcn CLI config (aliases, css entry)
public/assets/img/
  brand/                        portrait, favicon set
  logos/                        third-party institution marks
  projects/                     project screenshots and renders
  photography/                  the photography grid
public/assets/video/projects/   the 3D-print render clip
src/
  main.tsx                      mounts <App>
  App.tsx                       page shell, tab state, #hash deep links
  styles/
    globals.css                 Tailwind + design tokens bridged to @theme
    styles.css                  the design system (tokens, layout, components)
    trading-thumbnail.css       the transcribed thumbnail styles
  lib/utils.ts                  cn(), asset()
  hooks/
    use-media-query.ts          useMediaQuery, usePrefersReducedMotion
    use-word-cycle.ts           the rotating word in the statement
    use-copy-to-clipboard.ts    the email copy button
  components/
    ui/infinite-slider.tsx      motion-primitives InfiniteSlider
    ui/animated-tabs.tsx        the tablist, APG semantics + sliding highlight
    ui/animated-word.tsx        the crossfading word slot
    media.tsx                   <Media> / <Img> — load state + placeholders
    scroll-video.tsx            <ScrollVideo> — clip scrubbed by ScrollTrigger
    top-bar.tsx                 the fixed bar the hero's tab pill docks into
    hero.tsx  hero-collapse.ts  the hero and its pin/collapse timeline
    trading-thumbnail.tsx       the JSX-rendered trading cards
    trading-thumbnail-data.ts   their content
    section-tabs.tsx  credentials.tsx  statement.tsx
    features.tsx  project-grid.tsx  photography.tsx  contact.tsx  icons.tsx
```

Images live in `public/` and are referenced by absolute path (`/assets/img/…`),
which `asset()` in `lib/utils.ts` rewrites onto the deploy base so they resolve
under the project-page subpath as well as at the root. `<Media>`, `<Img>` and
`<ScrollVideo>` call it for you; a bare `<img>` or `<a href>` has to call it
itself. They are copied verbatim and keep stable URLs. They are grouped by **role**,
not by page section: a logo is a third-party mark reused in several places at a
fixed height and with a colour filter; a project shot is owned artwork cropped
to fill a card. Different constraints, different licensing, different
replacement cadence. Within each folder the name doesn't repeat the folder —
`logos/isep.png`, not `logos/logo-isep.png`.

### Styling — two systems, on purpose

`styles.css` is the design system: tokens in `:root`, then hand-tuned layout for
every section. It was not converted to utility classes, because there is nothing
to gain from restating 700 lines of tuned CSS as class strings.

Tailwind is imported **before** it in `globals.css` and is there for new
components — the ones that arrive as copy-paste shadcn/motion-primitives code
already written in utilities. The order is load-bearing: Tailwind's preflight
resets margins, list styles and image sizing, and `styles.css` re-establishes
the portfolio's own values on top. Utilities still win over both, because
Tailwind emits them into a later cascade layer than the unlayered rules in
`styles.css`.

`@theme inline` in `globals.css` republishes the existing tokens to Tailwind, so
new components can write `text-ink-3` or `bg-surface-2` instead of hard-coding
hexes that would drift.

### shadcn

`components.json` points the CLI at `src/styles/globals.css` and aliases
`@/components/ui`, so `npx shadcn@latest add <component>` drops files in the
right place with `cn()` already resolvable. `/components/ui` is the path the
registry assumes; keeping it means generated components import each other
correctly without hand-editing.

## Behaviour

- **Tabs** — Projects / Photography, full keyboard support (arrows, Home, End).
  They deep-link: `/#photography` and `/#projects` open their panel directly,
  and clicking a tab updates the URL via `replaceState`.
- **Images** — `<Media>` fades an image in once it decodes; if the file is
  missing the figure keeps its dimensions and shows a labelled placeholder
  instead of collapsing, so a not-yet-uploaded image leaves a hole the right
  shape. `<Img>` is the wrapper-less variant for logos.
- **Education / Internships** — infinite logo marquee, see below.
- **Rotating word** — "creative / unique / original / useful" crossfades in the
  statement. Holds at "creative" under `prefers-reduced-motion`.
- **"More projects"** — the button appears only when `MORE_PROJECTS` in
  `project-grid.tsx` is non-empty.

## The logo marquee

`src/components/credentials.tsx`, built on motion-primitives'
`InfiniteSlider`. The "Education / Internships" label sits outside the slider
and does not move.

`InfiniteSlider` renders k copies of its children in one flex track and animates
by exactly one copy plus one gap, which lands copy 2 where copy 1 began — hence
the seamless loop. Edits to the published source, documented in the file header:
the Next.js `'use client'` directive is dropped, `controls` is typed, remaining
props forward to the outer element, and **k is derived from the viewport instead
of being fixed at 2**.

That last one is a bug fix, not a preference. With two copies the loop point is
correct but the track only covers one copy's width at the end of a lap, so any
viewport wider than a single copy shows a growing empty tail that snaps full at
the reset. Five small logos are ~596px of coverage against an ~851px slider, so
the last ~255px sat empty for the back half of every 32s lap. It was invisible
in a narrow window (a VS Code preview pane, say) and obvious at full screen,
because the gap only opens once the slider is wider than one copy — roughly a
1000px window. It stops worsening past ~1120px, where `.page`'s `max-width`
caps the slider at 851px regardless of how wide the browser gets.

The copy count is computed from a measurement of **one copy**, never of the
whole track. The algebraically identical `(trackWidth + gap) / copies` creates a
feedback loop — the count changes a render before ResizeObserver reports the new
track width, so a stale width divided by the new count implies a larger count
still, which runs away and locks the page up.

Four things to know about the behaviour, because it differs from the CSS
marquee this replaced:

- **Hover slows, it does not pause.** `durationOnHover` is a speed, not a stop —
  a true pause is not one of the component's props. It is set to 240s, which
  reads as stopped.
- **Spacing and speed are props, not custom properties.** The 780px breakpoint
  that `styles.css` uses for this section is read in JS via `useMediaQuery`, and
  drives `gap` (56 → 36) and `duration` (32s → 24s).
- **`prefers-reduced-motion` is handled in React, not CSS.** The blanket
  `animation-duration: 0.01ms` rule in `styles.css` cannot reach a JS transform,
  so `<Credentials>` watches the same query and renders `.credentials__static` —
  the same logos, wrapped, no transform — instead of mounting the slider at all.
- **The track is `aria-hidden`.** The component duplicates its children, and a
  screen reader should not hear five institutions twice. A visually hidden `<ul>`
  next to it carries the real names, one announcement each.

The trade this makes: the old marquee was a CSS keyframe animation the
compositor ran off the main thread. This one is a `requestAnimationFrame` loop
writing a transform on every frame. Motion values bypass React re-renders, so it
is not as costly as it sounds, but it is main-thread work where there was none.
The measured rate matches the CSS version exactly — 20.4 px/s at 1280px — and it
is fine on its own. It is worth remembering when more animated components land
on the same page.

## Assets

Sources came from the design project and were resized, flattened onto the card
background and re-encoded. The whole image set is ~480 KB.

| Site file | Design source |
| --- | --- |
| `brand/portrait.jpg` | `pasted-1784977598202-0-ms09kphh-jkq7.png` |
| `brand/favicon-{16,32,512}.png`, `brand/apple-touch-icon.png` | `_originals/favicon-master.jpg` |
| `brand/og-card.png` | `_originals/favicon-master.jpg` |
| `logos/isep.png` | `image-1--ms0nxr7n-g5tm.png` |
| `logos/inha.png` | `image-2--ms0o0wg3-cfuq.png` |
| `logos/epc.png` | `logo_epc_demosten-1--mrzbrq8w-b0sf.png` |
| `logos/berkeley.png` | `adobe-express---file-1--ms0o4l0k-p19y.png` |
| `logos/capgemini.png` | `pasted-1784920594083-0-mrzbmwvg-thp5.png` |
| `projects/car-stands-a.jpg` | `pasted-1784925668257-0-mrzeno3i-v9vk.png` |
| `projects/car-stands-b.jpg` | `pasted-1784925675782-0-mrzentwq-2lns.png` |
| `projects/portfolio-website.jpg` | `pasted-1784988146257-0-ms0fuset-6anf.png` |
| `projects/events-it.jpg` | `pasted-1784924956174-0-mrze8emr-5rjr.png` |

The favicon is the **upper** square of Julien's signature mark, cropped 1:1
without stretching and laid on the page's own `#08090a` at the same corner
radius. The upper square fills the frame where the lower one left the bottom
right empty. The master is kept at `_originals/favicon-master.jpg`; regenerate
from there rather than upscaling a PNG. `apple-touch-icon.png` is deliberately
square-cornered and opaque, because iOS applies its own mask and would otherwise
round it twice.

`brand/og-card.png` is the link-preview image: 1200x630, the full mark on the
page's own `#08090a`. It is not the hero portrait, because the portrait ships raw
— the vignette and fades that make it work on the page are CSS layered over the
top, so a scraper only ever received the bare photograph. The mark is centred so
the square crop some messaging apps apply to thumbnails still frames it.

The resume is served straight from `public/assets/julien-chemery-resume.pdf`, so
replacing it is a file swap with no code change. The contact card links to it
through `asset()`, which is what keeps it working under the `/Portfolio/` base.

The trading-agent cards are no longer screenshots: they are rendered from JSX in
`trading-thumbnail.tsx` against `trading-thumbnail-data.ts`, transcribed from
`_originals/trading-thumbnails/*.html`. The three screenshots the design canvas
used for them have been dropped.

## Still to add

**More projects** — push onto `MORE_PROJECTS` at the top of
`src/components/project-grid.tsx`. The disclosure button reveals itself.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` builds and publishes to GitHub
Pages. **The repository's Settings → Pages → Source must be set to "GitHub
Actions"**, not "Deploy from a branch", or the workflow's deploy step fails.

The workflow derives `BASE_PATH` from the repository name, so the same file works
for a user site and a project repo with no edit: `JulienChemery/Portfolio`
resolves to `/Portfolio/`, and `<user>.github.io` would resolve to `/`. Locally
the base stays `/`.

Two things are absolute rather than base-relative on purpose: `og:url`,
`og:image` and `<link rel="canonical">` in `index.html` are full
`https://julienchemery.github.io/Portfolio/…` URLs, because link scrapers do not
resolve root-relative paths. They are the one place to edit if the site moves to
a custom domain.

Run `npm run preview` against a `BASE_PATH=/Portfolio/ npm run build` before
pushing if you have touched anything that resolves a path.

## Licence

The **code** is [CC BY-NC 4.0](LICENSE): fork it, learn from it and build on it
for anything non-commercial, as long as you credit Julien Chémery with a link
back to this repository and say what you changed. Commercial use of any kind is
not permitted, including reselling it or redistributing it as a template.

The **content** is not licensed at all and is excluded from that grant: the
photography, the portrait, the signature mark and everything derived from it,
the project imagery, the resume, and the written copy of the site. The
institution logos belong to their respective owners.

[NOTICE](NOTICE) is where that scope is written down, and it is the file to edit
if it changes. [LICENSE](LICENSE) carries the full Creative Commons text under a
short pointer to it.

**GitHub will show this repository's licence as "Other", and that cannot be
fixed.** GitHub detects only 13 licences, and `CC0-1.0` is the only Creative
Commons one among them, so `CC-BY-NC-4.0` is unrecognisable to it whatever the
file contains. The sidebar still links to `LICENSE`, and `package.json` carries
the SPDX id `CC-BY-NC-4.0` for tooling that reads it. Do not go rearranging the
licence files to try to make the sidebar say something else.

The site badges this repo as **"Source Available"** rather than "Open Source" on
purpose. A licence that restricts commercial use is not open source under the
OSI definition, and claiming otherwise is the kind of thing developers notice.
If the licence is ever loosened to a permissive one, change the badge in
`project-grid.tsx` back at the same time.

## Changes from the design defaults

- **Category pills, tech-stack lines and education dates** — removed from the
  markup and their rules deleted, not just hidden.
- **Name text shadow** — off.
- **Fonts** — Poppins throughout. Geist and Geist Mono are no longer loaded.
  Because Poppins sets wider, the hero's middle spacer column narrowed from
  420 px to 350 px and the role line dropped from 22 px to 21 px so
  "Agentic AI / Generative AI" still holds one line.
- **Profile picture gradient** — width 50, height 100, strength 0.75
  (`.hero__vignette`).
- **From Risk to Uncertainty** — thumbnail removed; the card is text-only.
- **Portfolio Website backdrop** — `projects/portfolio-website.jpg` was darkened
  30% in the pixels (brightness × 0.70), not via `.card__scrim`. The design
  export had already been deleted, so this re-encoded the shipped JPEG at q85 to
  limit generational loss. The pre-darkening file is kept at
  `_originals/portfolio-website-undarkened.jpg` — restore from there rather than
  brightening back up, and darken again from that copy for a different amount.

## Migration notes

The pre-React static site — plain `index.html`, `assets/css/styles.css`,
`assets/js/main.js`, no build step — is archived at
`_archive/portfolio-static-<timestamp>.zip`, with the old markup also kept
loose as `_archive/index.static.html.bak` for diffing. `_archive/` is gitignored.

One behavioural fix landed in the port: the copy-email checkmark carried a
`hidden` attribute that `main.js` never removed, and `styles.css` declares
`[hidden] { display: none !important }` — so the checkmark could never appear.
Both icons now stay mounted and `.is-copied` on the button does the swap, which
is what the CSS was always written to do.

## Verified

`npm run typecheck` and `npm run build` clean. Chrome 150 headless against the
production build at 1280px and 375px: no console errors, no horizontal overflow
at either width, no broken images. The marquee track measured at 20.4 px/s on
desktop and its gap switching to 36px below 780px. Under emulated
`prefers-reduced-motion: reduce` the slider is not mounted at all and the static
five-logo list renders in its place. `/#photography` opens the photography panel
directly with the Projects panel hidden.

The marquee seam specifically, since it had a bug: every rendered `.credential`
box was measured against the slider's own box on every animation frame, at
375 / 1280 / 1920 / 3440px, for 35–40s each — more than a full lap in all cases.
Zero frames with a visible gap at either edge; the trailing logo overhangs the
right edge by at least 397px at its worst. A 100s run confirms the track resets
exactly once per 32s lap, by exactly one lap (651.9px of a 1900px track), with
no other discontinuity. Copy count settles at 3 on desktop and 2 at 375px.

Re-verified before the first push to GitHub. `npm run typecheck` and
`BASE_PATH=/Portfolio/ npm run build` both clean. Every URL the site can request
under that base — 42 of them: the JS and CSS chunks, the four favicons, the
portrait, the five logos, the four project images, the render clip and its
poster, the resume PDF and all 19 photographs — was resolved against the files
actually emitted into `dist/`, and all 42 are present. That covers both path
systems: the ones Vite rewrites in `index.html`, and the ones `asset()` builds
at runtime from `BASE_URL`, which is compiled into the bundle as `/Portfolio/`.

Do **not** check this with `npm run preview` alone. Its SPA fallback answers any
unknown path with `index.html` and a 200, including paths ending in `.pdf` or
`.png`, so a missing asset looks fine over HTTP. GitHub Pages serves static
files and will return a real 404 for the same request. Check against `dist/`.
