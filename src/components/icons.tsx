/** Inline marks. Kept as local SVG rather than pulled from an icon package:
 *  the GitHub glyph is a brand mark that lucide deliberately does not ship, and
 *  the other two are the only icons on the page. */

export function GithubMark(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox='0 0 24 24'
      width='12'
      height='12'
      aria-hidden='true'
      fill='currentColor'
      {...props}
    >
      <path d='M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58l-.01-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z' />
    </svg>
  );
}

const strokeProps = {
  viewBox: '0 0 24 24',
  width: 14,
  height: 14,
  'aria-hidden': true,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function CopyIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg {...strokeProps} {...props}>
      <rect x='9' y='9' width='13' height='13' rx='2' />
      <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
    </svg>
  );
}

export function CheckIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg {...strokeProps} {...props}>
      <polyline points='20 6 9 17 4 12' />
    </svg>
  );
}
