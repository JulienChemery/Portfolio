import { motion } from 'framer-motion';
import { useWordCycle } from '@/hooks/use-word-cycle';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

type AnimatedWordProps = {
  words: readonly string[];
  /** Time each word is held, ms. */
  intervalMs?: number;
  className?: string;
};

/** A single word in a sentence, rotating on a spring. Every word is stacked in
 *  the same box and only the active one is at rest: the one it replaced sits
 *  above, the rest wait below, so the cycle always reads as a ticker running
 *  upward even when it wraps back to the first word.
 *
 *  The stack is a one-cell inline grid, which is what makes the box the width of
 *  the *longest* word rather than the current one. That is deliberate and it is
 *  the whole point: a box that resized per word moved the sentence's wrap points
 *  with it, so at some widths one word left the line count alone and the next
 *  added a line. A slot that never changes size cannot break differently. It
 *  costs a little slack after the shorter words, so callers put the rotating
 *  word where that slack falls at the end of a line — see .statement__title-tail.
 *
 *  Height comes from the same grid row, and `vertical-align: bottom` keeps the
 *  word sitting on the line it belongs to while `overflow: hidden` clips the
 *  travel of the two words that are on their way out and in. */
export function AnimatedWord({
  words,
  intervalMs,
  className,
}: AnimatedWordProps) {
  const index = useWordCycle(words, intervalMs);
  const reduceMotion = usePrefersReducedMotion();
  const outgoing = (index - 1 + words.length) % words.length;

  return (
    <span
      className={cn('inline-grid overflow-hidden align-bottom', className)}
    >
      {words.map((word, i) => (
        <motion.span
          key={word}
          // Every word in the one cell: they overlap, and the cell is as wide
          // as the widest of them.
          className='col-start-1 row-start-1 whitespace-pre'
          initial={false}
          animate={
            i === index
              ? { y: 0, opacity: 1 }
              : { y: i === outgoing ? '-100%' : '100%', opacity: 0 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 50, mass: 0.8 }
          }
          aria-hidden={i === index ? undefined : 'true'}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
