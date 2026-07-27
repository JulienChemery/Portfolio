import { Media } from '@/components/media';
import { ScrollVideo } from '@/components/scroll-video';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { TradingThumbnail } from '@/components/trading-thumbnail';
import { THUMBNAILS } from '@/components/trading-thumbnail-data';
import {
  useMediaQuery,
  usePrefersReducedMotion,
} from '@/hooks/use-media-query';

/** 01 — Trading Agent. The terminal mockups run the full width of the page and
 *  pass behind the text card, which sits on top of the strip rather than beside
 *  it. Same marquee as the credentials logos — see <InfiniteSlider>. */
export function TradingAgent() {
  const reduceMotion = usePrefersReducedMotion();
  // Matches the two breakpoints trading-thumbnail.css scales the cards at: a
  // smaller card means a shorter lap, which has to travel proportionally
  // faster to keep the same pixels-per-second.
  const isNarrow = useMediaQuery('(max-width: 780px)');
  const isMedium = useMediaQuery('(max-width: 960px)');

  const thumbnails = THUMBNAILS.map((data) => (
    <TradingThumbnail key={data.id} data={data} />
  ));

  const duration = isNarrow ? 42 : isMedium ? 52 : 60;

  return (
    <section className='feature feature--trading'>
      {/* aria-hidden as a whole: the slider renders its children twice, and
          three duplicated mockups full of French headlines is not something a
          screen reader should have to sit through. The summary below stands in
          for the alt text the three images used to carry. */}
      <div className='feature__marquee' aria-hidden='true'>
        {reduceMotion ? (
          <div className='feature__marquee-static'>{thumbnails}</div>
        ) : (
          <InfiniteSlider
            className='feature__marquee-track'
            gap={28}
            duration={duration}
            // Slows rather than stops, exactly as the credentials marquee does.
            durationOnHover={240}
          >
            {thumbnails}
          </InfiniteSlider>
        )}
      </div>

      <article className='card card--pad feature__card'>
        <h3 className='card__title card__title--lg'>Trading Agent</h3>
        <p className='card__body'>
          Combines multi-timeframe quantitative analysis with a custom MCP
          server. Reverse-engineers financial news APIs to ground investment
          strategies in real-time technical, fundamental data and news.
        </p>
        <p className='sr-only'>
          Concept mockups of the Trading Agent terminal: a multi-timeframe
          candlestick read on MSFT, GOOG and META, each paired with scored news
          headlines and a net sentiment bias.
        </p>
      </article>
    </section>
  );
}

/** 02 — the 3D-printed group: speakers plus the stackable car stands. The
 *  render is a clip rather than a still, played through by the scroll as the
 *  section passes — see <ScrollVideo>. */
export function PrintedProjects() {
  return (
    <section className='feature feature--speakers'>
      <ScrollVideo
        className='feature__media feature__media--square'
        src='/assets/video/projects/speakers-and-sub-dark.mp4'
        poster='/assets/img/projects/speakers-and-sub-dark-poster.jpg'
        alt='The 3D-printed 2.1 set turning: two spherical satellites and the hexagonal subwoofer.'
      />
      <div className='card-stack feature__card'>
        <article className='card card--pad'>
          <h3 className='card__title'>3D-Printed 2.1 Speakers</h3>
          <p className='card__body'>
            Custom spherical satellites designed in Fusion 360 paired with a
            remixed{' '}
            <a
              href='https://www.printables.com/@HexiBase'
              target='_blank'
              rel='noopener noreferrer'
            >
              HexiBase
            </a>{' '}
            subwoofer. Built around an acoustic study of PLA and powered by a
            repurposed JBL amplifier.
          </p>
        </article>
        <article className='card card--pad card--row'>
          <div className='thumbpair'>
            <Media
              src='/assets/img/projects/car-stands-a.jpg'
              alt=''
              loading='lazy'
            />
            <Media
              src='/assets/img/projects/car-stands-b.jpg'
              alt=''
              loading='lazy'
            />
          </div>
          <div>
            <h3 className='card__title card__title--sm'>Stackable Car Stands</h3>
            <p className='card__body card__body--sm'>
              Modular, display stands designed for 1:32 and 1:24 scale model
              cars.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
