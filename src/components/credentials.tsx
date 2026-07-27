import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { Img } from '@/components/media';
import {
  useMediaQuery,
  usePrefersReducedMotion,
} from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

type Credential = {
  src: string;
  alt: string;
  /** Optical height in px — each mark is balanced by eye, not by bounding box. */
  height: number;
  /** Mono-colour marks get knocked out to white; full-colour ones are left alone. */
  invert?: boolean;
};

const CREDENTIALS: readonly Credential[] = [
  {
    src: '/assets/img/logos/isep.png',
    alt: 'ISEP — École d’ingénieurs du numérique',
    height: 26,
    invert: true,
  },
  {
    src: '/assets/img/logos/inha.png',
    alt: 'Inha University Hospital',
    height: 21,
  },
  { src: '/assets/img/logos/epc.png', alt: 'EPC Groupe', height: 26, invert: true },
  {
    src: '/assets/img/logos/berkeley.png',
    alt: 'UC Berkeley',
    height: 19,
    invert: true,
  },
  {
    src: '/assets/img/logos/capgemini.png',
    alt: 'Capgemini',
    height: 24,
    invert: true,
  },
];

function Logo({ credential, alt }: { credential: Credential; alt: string }) {
  return (
    <li className='credential'>
      <Img
        className={cn(
          'credential__logo',
          credential.invert && 'credential__logo--invert',
        )}
        src={credential.src}
        alt={alt}
        height={credential.height}
        style={{ height: credential.height }}
        loading='lazy'
      />
    </li>
  );
}

export function Credentials() {
  const reduceMotion = usePrefersReducedMotion();
  // The 780px breakpoint that styles.css uses for this section. Spacing and
  // speed are component props now, so the value has to be read here rather than
  // declared in the media query alongside everything else it affects.
  const isNarrow = useMediaQuery('(max-width: 780px)');

  const logos = CREDENTIALS.map((credential) => (
    // alt is empty inside the slider: the track is aria-hidden as a whole,
    // because InfiniteSlider renders its children twice and a screen reader
    // should not hear the same five institutions twice. The real list follows.
    <Logo key={credential.src} credential={credential} alt='' />
  ));

  return (
    <section className='credentials' aria-label='Education and internships'>
      {/* Stays put — only the logos travel. */}
      <h2 className='credentials__label'>Education / Internships</h2>

      {reduceMotion ? (
        <ul className='credentials__static'>
          {CREDENTIALS.map((credential) => (
            <Logo
              key={credential.src}
              credential={credential}
              alt={credential.alt}
            />
          ))}
        </ul>
      ) : (
        <>
          <InfiniteSlider
            className='credentials__slider'
            gap={isNarrow ? 36 : 56}
            duration={isNarrow ? 24 : 32}
            // The component slows on hover rather than stopping outright — a
            // true pause is not one of its props. 240s over a ~56px gap reads
            // as "stopped" without freezing mid-transform.
            durationOnHover={240}
            aria-hidden='true'
          >
            {logos}
          </InfiniteSlider>

          {/* The accessible copy of the same list, one announcement per logo. */}
          <ul className='sr-only'>
            {CREDENTIALS.map((credential) => (
              <li key={credential.src}>{credential.alt}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
