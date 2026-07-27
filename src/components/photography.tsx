import { Media } from '@/components/media';
import { AnimatedWord } from '@/components/ui/animated-word';

/* The full stop rides along with each word on purpose. The rotating slot is as
   wide as the longest word, so a period left outside it would sit adrift after
   the shorter ones; inside, the slack falls after the period, at the end of the
   sentence, where it is invisible. */
const MOODS = ['cinematic.', 'nostalgic.', 'timeless.'] as const;

/** The gallery, in display order. `ratio` is the file's real width / height,
 *  measured off the original before it was resized, and the mosaic lays the
 *  photos out from it — see `.masonry` in styles.css. Nothing is cropped, so a
 *  wrong ratio here shows up as a tile that does not line up with its row.
 *
 *  Landscapes are spaced two portraits apart so no row is all one shape; the
 *  order is the only thing deciding how the puzzle falls, and it is free to
 *  change. File names keep the camera's frame number, so a photo can always be
 *  traced back to Julien's original. */
const PHOTOS = [
  { file: '2j2a0114-panorama.webp', ratio: 1.6701 },
  { file: '2j2a0328.webp', ratio: 0.8001 },
  { file: '2j2a6279.webp', ratio: 0.6667 },
  { file: '2j2a6795.webp', ratio: 1.5 },
  { file: '2j2a7659.webp', ratio: 0.8001 },
  { file: '2j2a7816.webp', ratio: 0.6667 },
  { file: '2j2a7146.webp', ratio: 1.5 },
  { file: '2j2a8333.webp', ratio: 0.6667 },
  { file: '2j2a8720.webp', ratio: 0.6667 },
  { file: '2j2a7733.webp', ratio: 1.5 },
  { file: '2j2a8826.webp', ratio: 0.8 },
  { file: '2j2a8845.webp', ratio: 0.8 },
  { file: '2j2a9172.webp', ratio: 1.5 },
  { file: '2j2a8944.webp', ratio: 0.8 },
  { file: '2j2a9155.webp', ratio: 0.8 },
  { file: '2j2a9180.webp', ratio: 1.5001 },
  { file: '2j2a6256.webp', ratio: 0.8001 },
  { file: '2j2a9666.webp', ratio: 0.8001 },
  { file: '2j2a9946.webp', ratio: 0.8001 },
] as const;

export function Photography() {
  return (
    <section className='photography'>
      <h2 className='statement__title'>
        Photography,{' '}
        <span className='muted'>
          making the everyday feel <AnimatedWord words={MOODS} />
        </span>
      </h2>
      <div className='masonry'>
        {PHOTOS.map((photo) => (
          <Media
            key={photo.file}
            className='photo'
            style={{ '--ar': photo.ratio } as React.CSSProperties}
            src={`/assets/img/photography/${photo.file}`}
            alt='Photograph by Julien Chémery'
            placeholder='Photo'
            loading='lazy'
          />
        ))}
        {/* Last-row shim. Without it the few photos left over on the final row
            share all the leftover width between them and tower over every row
            above; this takes the slack instead and they keep their size. */}
        <i className='masonry__filler' aria-hidden='true' />
      </div>
    </section>
  );
}
