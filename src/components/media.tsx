import { useCallback, useState } from 'react';
import { asset, cn } from '@/lib/utils';

type Status = 'pending' | 'loaded' | 'error';

/** Shared load tracking. The ref callback matters as much as the events: an
 *  image already in the HTTP cache can finish decoding before React attaches
 *  onLoad, and without this check it would stay at opacity 0 forever. */
function useImageStatus() {
  const [status, setStatus] = useState<Status>('pending');

  const ref = useCallback((node: HTMLImageElement | null) => {
    if (!node?.complete) return;
    setStatus(node.naturalWidth > 0 ? 'loaded' : 'error');
  }, []);

  return {
    status,
    imgProps: {
      ref,
      onLoad: () => setStatus('loaded'),
      onError: () => setStatus('error'),
    },
  };
}

type ImgProps = React.ComponentPropsWithoutRef<'img'>;

/** A bare <img> that earns `is-loaded` once it decodes. For images with no
 *  .media wrapper — logos, mostly — where the CSS hides a broken file rather
 *  than showing a placeholder in its place. */
export function Img({ className, src, ...props }: ImgProps) {
  const { status, imgProps } = useImageStatus();
  return (
    <img
      className={cn(className, status === 'loaded' && 'is-loaded')}
      src={typeof src === 'string' ? asset(src) : src}
      {...imgProps}
      {...props}
    />
  );
}

type MediaProps = ImgProps & {
  /** Extra classes for the <figure>, not the <img> — `.media` is always added. */
  className?: string;
  /** Placeholder caption for a missing file. Defaults to the alt text. */
  placeholder?: string;
  style?: React.CSSProperties;
};

/** The .media figure + its image. A file that 404s keeps the figure at its full
 *  size and labels it, so a not-yet-uploaded photo leaves a hole the right shape
 *  instead of collapsing the layout around it. */
export function Media({
  className,
  placeholder,
  style,
  alt = '',
  src,
  ...props
}: MediaProps) {
  const { status, imgProps } = useImageStatus();

  return (
    <figure
      className={cn('media', className, status === 'error' && 'is-empty')}
      style={style}
      data-placeholder={placeholder ?? alt ?? 'Image'}
    >
      <img
        className={cn(status === 'loaded' && 'is-loaded')}
        src={typeof src === 'string' ? asset(src) : src}
        alt={alt}
        {...imgProps}
        {...props}
      />
    </figure>
  );
}
