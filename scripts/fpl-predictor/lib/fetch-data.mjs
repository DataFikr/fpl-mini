// Data layer: fetch + disk-cache the public FPL API so the backtest is
// reproducible and offline-friendly after the first run.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..');
export const CACHE_DIR = join(ROOT, '.cache');
const BASE = process.env.FPL_API_BASE_URL || 'https://fantasy.premierleague.com/api';

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function getJSON(url, cacheName, { refresh = false } = {}) {
  await mkdir(CACHE_DIR, { recursive: true });
  const cacheFile = join(CACHE_DIR, cacheName);
  if (!refresh && (await exists(cacheFile))) {
    return JSON.parse(await readFile(cacheFile, 'utf8'));
  }
  const res = await fetch(url, { headers: { 'User-Agent': 'fpl-predictor/1.0' } });
  if (!res.ok) throw new Error(`FPL API ${res.status} for ${url}`);
  const data = await res.json();
  await writeFile(cacheFile, JSON.stringify(data));
  return data;
}

export const loadBootstrap = (opts) =>
  getJSON(`${BASE}/bootstrap-static/`, 'bootstrap.json', opts);

export const loadFixtures = (opts) =>
  getJSON(`${BASE}/fixtures/`, 'fixtures.json', opts);

export const loadLive = (gw, opts) =>
  getJSON(`${BASE}/event/${gw}/live/`, `live-${gw}.json`, opts);

/** Returns Map<gw, Map<elementId, {points, minutes}>> for the requested gws. */
export async function loadLiveMap(gws, opts) {
  const byGw = new Map();
  for (const gw of gws) {
    const live = await loadLive(gw, opts);
    const m = new Map();
    for (const el of live.elements) {
      m.set(el.id, { points: el.stats.total_points, minutes: el.stats.minutes });
    }
    byGw.set(gw, m);
  }
  return byGw;
}
