import { useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react';
import type { Candle, Thumbnail } from '@/components/trading-thumbnail-data';

/** Regular candle body width, and the wider one used for the current month. */
const BODY_W = 20;
const CURRENT_BODY_W = 22;

/** The card is authored at this size and scaled down by CSS (--tt-scale), so
 *  the internal layout below never has to be re-tuned per breakpoint. */
export const THUMBNAIL_BASE = { width: 640, height: 420 };

function Wick({ candle, current = false }: { candle: Candle; current?: boolean }) {
  const width = current ? CURRENT_BODY_W : BODY_W;
  const colour = candle.up ? '#3ecf8e' : '#f0654f';
  return (
    <>
      <line
        x1={candle.x}
        y1={candle.top}
        x2={candle.x}
        y2={candle.bottom}
        stroke={colour}
        strokeWidth={current ? 2.6 : 2.2}
      />
      <rect
        x={candle.x - width / 2}
        y={candle.bodyTop}
        width={width}
        height={candle.bodyH}
        fill={colour}
      />
    </>
  );
}

/** One terminal mockup. Self-contained: fixed internal geometry, its own
 *  palette, no dependency on the page's design tokens. */
export function TradingThumbnail({ data }: { data: Thumbnail }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const chartAnchorRef = useRef<SVGCircleElement>(null);
  const newsAnchorRef = useRef<HTMLSpanElement>(null);
  const beamRef = useRef<SVGPathElement>(null);

  // useId per instance: the slider renders this component several times over,
  // and two <filter id="softGlow"> in one document is one too many.
  const uid = useId().replace(/:/g, '');
  const glowId = `tt-glow-${uid}`;
  const beamId = `tt-beam-${uid}`;

  // The beam links the current candle to the headline that moved it. Its two
  // ends are laid out by the chart and by the news list independently, so the
  // curve can only be measured, never hard-coded.
  const drawBeam = useCallback(() => {
    const card = cardRef.current;
    const chart = chartAnchorRef.current;
    const news = newsAnchorRef.current;
    const beam = beamRef.current;
    if (!card || !chart || !news || !beam) return;

    const cardBox = card.getBoundingClientRect();
    // The card is drawn at --tt-scale. Rects come back scaled, the SVG's
    // coordinate space does not, so every measurement is divided back out.
    const scale = cardBox.width / card.offsetWidth || 1;
    const a = chart.getBoundingClientRect();
    const b = news.getBoundingClientRect();

    const x1 = (a.left + a.width / 2 - cardBox.left) / scale;
    const y1 = (a.top + a.height / 2 - cardBox.top) / scale;
    const x2 = (b.left + b.width / 2 - cardBox.left) / scale;
    const y2 = (b.top + b.height / 2 - cardBox.top) / scale;

    const midY = (y1 + y2) / 2;
    beam.setAttribute(
      'd',
      `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`,
    );
  }, []);

  useLayoutEffect(() => {
    drawBeam();
    const card = cardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(drawBeam);
    observer.observe(card);
    return () => observer.disconnect();
  }, [drawBeam]);

  // Poppins is not what this card renders in, but the mono stack can still
  // reflow once a webfont settles — redraw when the document says it has.
  useEffect(() => {
    document.fonts?.ready.then(drawBeam);
  }, [drawBeam]);

  const now = data.current;
  const nowColour = now.up ? '#3ecf8e' : '#f0654f';

  return (
    <figure className='tt'>
      <div className='tt__inner'>
        <div className='tt__stage'>
          <div className='tt__card' ref={cardRef}>
            <section className='tt__quant'>
              <div className='tt__quant-head'>
                <div className='tt__ticker-block'>
                  <span className='tt__symbol'>{data.ticker}</span>
                  <span className='tt__price'>{data.price}</span>
                  <span
                    className={`tt__delta${data.deltaUp ? ' tt__delta--up' : ''}`}
                  >
                    {data.delta}
                  </span>
                </div>
                <div className='tt__head-right'>
                  <span className='tt__tf'>{data.timeframe}</span>
                  <span className='tt__target'>{data.target}</span>
                  <span className='tt__upside'>{data.upside}</span>
                </div>
              </div>

              <div className='tt__chart'>
                <svg viewBox='0 0 600 214' preserveAspectRatio='none'>
                  <defs>
                    <filter
                      id={glowId}
                      x='-60%'
                      y='-60%'
                      width='220%'
                      height='220%'
                    >
                      <feGaussianBlur stdDeviation='3' result='b' />
                      <feMerge>
                        <feMergeNode in='b' />
                        <feMergeNode in='SourceGraphic' />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* analyst target reference */}
                  <line
                    x1='0'
                    y1={data.targetRef.y}
                    x2='600'
                    y2={data.targetRef.y}
                    stroke='#3ecf8e'
                    strokeOpacity='0.35'
                    strokeWidth='1'
                    strokeDasharray='6 5'
                  />
                  <text
                    x='8'
                    y={data.targetRef.y + 12.5}
                    fontSize='12'
                    fill='#3ecf8e'
                    fillOpacity='0.85'
                  >
                    {data.targetRef.label}
                  </text>

                  {/* 52w low reference */}
                  <line
                    x1='0'
                    y1={data.lowRef.y}
                    x2='600'
                    y2={data.lowRef.y}
                    stroke='#7c8a9a'
                    strokeOpacity='0.4'
                    strokeWidth='1'
                    strokeDasharray='6 5'
                  />
                  <text
                    x={data.lowRef.labelX}
                    y={data.lowRef.y - 6.1}
                    fontSize='12'
                    fill='#7c8a9a'
                    fillOpacity='0.85'
                  >
                    {data.lowRef.label}
                  </text>

                  {/* monthly OHLC, Jul'25 -> Jul'26 */}
                  <g>
                    {data.candles.map((candle) => (
                      <Wick key={candle.x} candle={candle} />
                    ))}

                    <g filter={`url(#${glowId})`}>
                      <Wick candle={now} current />
                    </g>
                    <circle
                      ref={chartAnchorRef}
                      cx={now.x}
                      cy={now.top}
                      r='2.8'
                      fill='#ffd27a'
                    />
                    <text
                      x='486'
                      y={now.top - 9}
                      fontSize='12'
                      fill={nowColour}
                      fontWeight='700'
                    >
                      Now
                    </text>
                  </g>

                  {/* 3-month SMA of the real closes */}
                  <polyline
                    points={data.sma}
                    fill='none'
                    stroke='#e8a33d'
                    strokeWidth='2'
                    strokeOpacity='0.9'
                    filter={`url(#${glowId})`}
                  />
                </svg>
              </div>
            </section>

            <div className='tt__seam' />

            <section className='tt__news'>
              <div className='tt__chrome'>lesechos://finance-marches</div>
              <div className='tt__rows'>
                {data.news.map((row) => (
                  <div
                    key={row.headline}
                    className={`tt__row${
                      row.highlight ? ` tt__row--hot-${row.highlight}` : ''
                    }`}
                  >
                    <span className='tt__headline'>{row.headline}</span>
                    <span className={`tt__pill tt__pill--${row.tone}`}>
                      {row.pill}
                    </span>
                    {row.highlight && (
                      <span className='tt__node' ref={newsAnchorRef} />
                    )}
                  </div>
                ))}
              </div>
              <div className='tt__synthesis'>
                <span className={`tt__score tt__score--${data.scoreTone}`}>
                  {data.score}
                </span>
                <span className='tt__bias'>{data.bias}</span>
              </div>
            </section>

            <svg className='tt__beam-layer'>
              <defs>
                <linearGradient
                  id={beamId}
                  x1='0%'
                  y1='0%'
                  x2='100%'
                  y2='100%'
                >
                  <stop offset='0%' stopColor='#ffd27a' stopOpacity='0.9' />
                  <stop offset='100%' stopColor='#3ecf8e' stopOpacity='0.7' />
                </linearGradient>
              </defs>
              <path
                ref={beamRef}
                className='tt__beam'
                stroke={`url(#${beamId})`}
                d=''
              />
            </svg>
          </div>

          <figcaption className='tt__caption'>{data.caption}</figcaption>
        </div>
      </div>
    </figure>
  );
}
