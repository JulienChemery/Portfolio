/* The three Trading Agent terminal mockups, transcribed from Julien's source
 * files in _originals/trading-thumbnails/. Nothing here is invented: every
 * candle, level and headline is the one in those files.
 *
 * All geometry is in the chart's own 600 x 214 viewBox. A candle is a wick
 * (top -> bottom) plus a body (bodyTop, bodyH); the x is the centre line, and
 * the body rect is derived from it, so widths stay consistent across the set.
 */

export type Candle = {
  /** Centre of the wick. The body rect is drawn around it. */
  x: number;
  top: number;
  bottom: number;
  bodyTop: number;
  bodyH: number;
  up: boolean;
};

export type NewsRow = {
  headline: string;
  pill: string;
  tone: 'bull' | 'bear' | 'value';
  /** The one highlighted row. It carries the anchor the beam lands on. */
  highlight?: 'bull' | 'bear';
};

export type Thumbnail = {
  id: string;
  ticker: string;
  price: string;
  delta: string;
  deltaUp: boolean;
  timeframe: string;
  target: string;
  upside: string;
  /** Analyst target reference line. */
  targetRef: { y: number; label: string };
  /** 52-week low reference line. Its label sits left or right of the chart. */
  lowRef: { y: number; labelX: number; label: string };
  candles: Candle[];
  /** Current, partial month. Drawn heavier and glowing, and beam origin. */
  current: Candle;
  /** 3-month SMA of the real closes. */
  sma: string;
  news: NewsRow[];
  score: string;
  scoreTone: 'bull' | 'amber';
  bias: string;
  caption: string;
};

export const THUMBNAILS: readonly Thumbnail[] = [
  {
    id: 'msft',
    ticker: 'MSFT',
    price: '$381.70',
    delta: '−25.7% 1Y',
    deltaUp: false,
    timeframe: 'Monthly · 12mo',
    target: 'Target $561',
    upside: '+47% · fwd P/E 21x',
    targetRef: { y: 13.5, label: 'Analyst target $561' },
    lowRef: { y: 196.1, labelX: 8, label: '52w low $349.20' },
    candles: [
      { x: 24, top: 18.2, bottom: 75.8, bodyTop: 37.2, bodyH: 31.9, up: true },
      { x: 69, top: 33.1, bottom: 67.3, bodyTop: 35.9, bodyH: 24.4, up: false },
      { x: 114, top: 49.4, bottom: 72.6, bodyTop: 50.6, bodyH: 15.1, up: true },
      { x: 159, top: 19.7, bottom: 60.9, bodyTop: 50.5, bodyH: 3, up: true },
      { x: 204, top: 44.5, bottom: 96.3, bodyTop: 49.0, bodyH: 23.9, up: false },
      { x: 250, top: 71.7, bottom: 91.2, bodyTop: 76.0, bodyH: 4.2, up: false },
      { x: 295, top: 74.9, bottom: 134.2, bodyTop: 79.5, bodyH: 46.7, up: false },
      { x: 340, top: 125.8, bottom: 168.0, bodyTop: 126.2, bodyH: 32.3, up: false },
      { x: 385, top: 141.0, bottom: 190.0, bodyTop: 158.4, bodyH: 19.6, up: false },
      { x: 430, top: 123.2, bottom: 183.2, bodyTop: 145.6, bodyH: 29.6, up: true },
      { x: 476, top: 108.9, bottom: 151.5, bodyTop: 108.9, bodyH: 32.3, up: true },
      { x: 521, top: 85.1, bottom: 196.1, bodyTop: 96.4, bodyH: 79.2, up: false },
    ],
    // Jul'26 (current, partial month): small bounce off the 52w low
    current: { x: 566, top: 147.1, bottom: 175.2, bodyTop: 166.9, bodyH: 3, up: true },
    sma: '114,49.3 159,53.8 204,58.1 250,67.9 295,93.1 340,121.6 385,154.2 430,160.7 476,144.2 521,143.4 566,150.8',
    news: [
      {
        headline: 'Microsoft au plus bas multiple depuis 2023, Azure/IA intacts',
        pill: 'Sous-évalué',
        tone: 'value',
        highlight: 'bull',
      },
      {
        headline: 'Consensus analystes : objectif de cours relevé à 561$',
        pill: 'Bullish_sentiment',
        tone: 'bull',
      },
      {
        headline: 'PEG 1.18x : nettement sous sa moyenne 10 ans (∼6.7x)',
        pill: 'PEG bas',
        tone: 'value',
      },
    ],
    score: 'NET_SCORE +0.81',
    scoreTone: 'bull',
    bias: '· BIAIS: SOUS-ÉVALUÉ',
    caption: 'Concept mockup · real MSFT OHLC via tvDatafeed, Jul 2026',
  },
  {
    id: 'goog',
    ticker: 'GOOG',
    price: '$319.09',
    delta: '+66.6% 1Y',
    deltaUp: true,
    timeframe: 'Monthly · 12mo',
    target: 'Target $422',
    upside: '+32% · fwd P/E 22x',
    targetRef: { y: 13.5, label: 'Analyst target $422' },
    lowRef: { y: 196.1, labelX: 470, label: '52w low $188.70' },
    candles: [
      { x: 24.0, top: 188.1, bottom: 207.7, bodyTop: 192.8, bodyH: 12.6, up: true },
      { x: 69.2, top: 175.2, bottom: 196.1, bodyTop: 176.6, bodyH: 18.7, up: true },
      { x: 114.3, top: 142.8, bottom: 181.8, bodyTop: 153.1, bodyH: 27.1, up: true },
      { x: 159.5, top: 115.2, bottom: 158.5, bodyTop: 123.2, bodyH: 31.8, up: true },
      { x: 204.7, top: 86.4, bottom: 131.3, bodyTop: 93.1, bodyH: 29.6, up: true },
      { x: 249.8, top: 90.2, bottom: 110.9, bodyTop: 95.2, bodyH: 3.0, up: false },
      { x: 295.0, top: 75.8, bottom: 100.6, bodyTop: 78.7, bodyH: 16.4, up: true },
      { x: 340.2, top: 69.6, bottom: 111.3, bodyTop: 80.3, bodyH: 19.7, up: false },
      { x: 385.3, top: 100.2, bottom: 131.2, bodyTop: 106.6, bodyH: 12.6, up: false },
      { x: 430.5, top: 44.2, bottom: 118.6, bodyTop: 44.7, bodyH: 72.1, up: true },
      { x: 475.7, top: 27.1, bottom: 50.7, bodyTop: 47.8, bodyH: 3.0, up: false },
      { x: 520.8, top: 50.5, bottom: 82.5, bodyTop: 52.1, bodyH: 15.0, up: false },
    ],
    // Jul'26 (current, partial month): pulling back from the highs
    current: { x: 566.0, top: 50.7, bottom: 97.2, bodyTop: 66.1, bodyH: 27.9, up: false },
    sma: '114.3,174.2 159.5,151.0 204.7,123.1 249.8,104.8 295.0,90.0 340.2,92.3 385.3,99.3 430.5,88.0 475.7,71.0 520.8,53.6 566.0,70.0',
    news: [
      {
        headline: "Alphabet : FCF négatif pour la 1ère fois depuis l'IPO",
        pill: 'FCF négatif',
        tone: 'bear',
        highlight: 'bear',
      },
      {
        headline: 'Résultats au-dessus des attentes, capex IA en flèche (+100%)',
        pill: 'Bat le consensus',
        tone: 'bull',
      },
    ],
    score: 'NET_SCORE +0.35',
    scoreTone: 'amber',
    bias: '· BIAIS: MITIGÉ (capex IA)',
    caption:
      'Concept mockup · real GOOG OHLC & fundamentals via yfinance, Jul 2026',
  },
  {
    id: 'meta',
    ticker: 'META',
    price: '$595.19',
    delta: '−16.6% 1Y',
    deltaUp: false,
    timeframe: 'Monthly · 12mo',
    target: 'Target $826',
    upside: '+39% · fwd P/E 16x',
    targetRef: { y: 13.5, label: 'Analyst target $826' },
    lowRef: { y: 196.1, labelX: 8, label: '52w low $520.26' },
    candles: [
      { x: 24.0, top: 38.1, bottom: 94.0, bodyTop: 44.8, bodyH: 21.9, up: true },
      { x: 69.2, top: 31.2, bottom: 70.2, bodyTop: 52.4, bodyH: 13.2, up: false },
      { x: 114.3, top: 34.4, bottom: 75.7, bodyTop: 68.2, bodyH: 4.9, up: true },
      { x: 159.5, top: 53.3, bottom: 121.2, bodyTop: 75.9, bodyH: 43.7, up: false },
      { x: 204.7, top: 113.0, bottom: 159.7, bodyTop: 115.0, bodyH: 4.8, up: false },
      { x: 249.8, top: 82.1, bottom: 126.0, bodyTop: 112.5, bodyH: 12.3, up: true },
      { x: 295.0, top: 62.4, bottom: 148.5, bodyTop: 78.8, bodyH: 32.2, up: true },
      { x: 340.2, top: 76.0, bottom: 131.6, bodyTop: 80.0, bodyH: 39.7, up: false },
      { x: 385.3, top: 105.0, bottom: 196.1, bodyTop: 126.2, bodyH: 38.9, up: false },
      { x: 430.5, top: 93.8, bottom: 172.5, bodyTop: 141.3, bodyH: 19.0, up: true },
      { x: 475.7, top: 122.8, bottom: 152.9, bodyTop: 129.0, bodyH: 10.7, up: true },
      { x: 520.8, top: 123.1, bottom: 184.2, bodyTop: 130.3, bodyH: 40.1, up: false },
    ],
    // Jul'26 (current, partial month): still working off the March low
    current: { x: 566.0, top: 97.0, bottom: 162.2, bodyTop: 143.7, bodyH: 7.6, up: false },
    sma: '114.3,59.5 159.5,84.4 204.7,102.5 249.8,117.3 295.0,103.7 340.2,103.7 385.3,121.2 430.5,142.0 475.7,145.2 520.8,146.9 566.0,150.2',
    news: [
      {
        headline:
          "Meta au plus bas de l'année malgré une pub qui accélère (+33%)",
        pill: 'Sous-évalué',
        tone: 'value',
        highlight: 'bull',
      },
      {
        headline:
          'Capex 2026 relevé à 125-145 Md$, Reality Labs toujours dans le rouge',
        pill: 'Capex_risk',
        tone: 'bear',
      },
    ],
    score: 'NET_SCORE +0.52',
    scoreTone: 'bull',
    bias: '· BIAIS: SOUS-ÉVALUÉ',
    caption:
      'Concept mockup · real META OHLC & fundamentals via yfinance, Jul 2026',
  },
];
