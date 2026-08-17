import { Config } from '@remotion/cli/config';

/**
 * Social masters are vertical and text-heavy, so quality is worth more than
 * render time here — a 60s 1080x1920 render is ~2 minutes on the founder's
 * machine and runs in the background.
 */
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
// CRF 18 keeps burned Bebas captions crisp; the platforms re-encode anyway,
// so shipping a soft master just compounds their compression.
Config.setCrf(18);
Config.setConcurrency(4);

export {};
