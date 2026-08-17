import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';

const bebas = loadBebas();
// Only the weights actually used below — the default pulls every weight and
// subset, which is 40+ network requests per render.
const manrope = loadManrope('normal', { weights: ['600', '700', '800'], subsets: ['latin'] });

/**
 * Sportify tokens, mirrored from src/app/app/_styles/sportify-fpl.css so the
 * video reads as the same product as the site.
 *
 * The one deliberate divergence: `green`. The system's --green (#009C54) is
 * tuned for the light app background and goes muddy on ink under video
 * compression, so video uses the brighter #7CFB9E that the OG share card
 * already uses on its dark ground (src/app/api/og/league/route.tsx).
 */
export const C = {
  ink: '#150000',
  ink2: '#2F0000',
  inkDeep: '#0A0000',
  red: '#FF5050',
  redDark: '#CC4040',
  amber: '#FFB35C',
  yellow: '#FFD100',
  green: '#7CFB9E',
  white: '#FFFFFF',
  bg: '#FAFAFA',
  t2: '#5B5757',
  dim: 'rgba(250,250,250,.55)',
  dimmer: 'rgba(250,250,250,.28)',
  hair: 'rgba(250,250,250,.10)',
} as const;

export const F = {
  display: bebas.fontFamily,
  body: manrope.fontFamily,
} as const;

/** 9:16 master. Safe areas keep captions clear of platform chrome. */
export const V = {
  width: 1080,
  height: 1920,
  fps: 30,
  safeTop: 220,
  safeBottom: 320,
} as const;

/** The pointed-hexagon signature, as a clip-path. */
export const HEX = 'polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%)';

export const riskColor = (risk: 'hi' | 'md' | 'lo') =>
  risk === 'hi' ? C.red : risk === 'md' ? C.amber : C.green;

export const riskLabel = (risk: 'hi' | 'md' | 'lo') =>
  risk === 'hi' ? 'HIGH' : risk === 'md' ? 'MED' : 'LOW';
