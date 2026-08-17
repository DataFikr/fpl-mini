# Captured data snapshots

FR-08 imports the app's data module directly. FR-01 can't — its headlines come from an API route
that needs a running server, so the payload is **captured** here instead.

These are real outputs of the real engine, not hand-written. Recapture whenever the story should
reflect a new gameweek.

## `fr01-headlines.json`

The live output of `GET /api/leagues/[id]/headlines`. Recapture with the dev server running in
demo mode (`FPL_DEMO_SEASON=2025-26`, already set in `.env.local`):

```bash
# from the repo root, with `npx next dev` running
curl -s "http://localhost:3000/api/leagues/150789/headlines?gw=20" \
  -o video/src/data/fr01-headlines.json
```

Note the dev server may pick port 3002 if 3000 is held — check the startup log.

## `fr01-tags.json`

The full tag vocabulary the headlines engine can emit, extracted from
`src/app/api/leagues/[id]/headlines/route.ts` so the video can never show a tag the product
doesn't actually produce. Regenerate:

```bash
node -e "
const fs=require('fs');
const src=fs.readFileSync('src/app/api/leagues/[id]/headlines/route.ts','utf8');
const TONE={disaster:'#FF5050',genius:'#009C54',banter:'#150000',gossip:'#FFD100'};
const re=/tag:\s*'([^']+)',\s*tone:\s*TONE\.(\w+),\s*sentiment:\s*'(\w+)'/g;
let m,rows=[]; while((m=re.exec(src))) rows.push({tag:m[1],tone:TONE[m[2]],sentiment:m[3]});
fs.writeFileSync('video/src/data/fr01-tags.json', JSON.stringify(rows,null,2)+'\n');
"
```

## Names on screen — deliberate constraint

The demo league's roster (`src/lib/demo/fpl-demo.ts`) carries **real-looking FPL entry IDs and
real first/last manager names**, with synthesized points. Videos therefore show **team names only**
(`Kipas Lipas`, `Meriam Pak Maon`) and never the `detail.manager` field.

Team names are self-chosen handles and are the unit the group chat actually uses — "Kipas Lipas
left 21 on the bench" is both funnier and far less personally identifying than a real full name.
Do not surface `detail.manager` in any composition without the founder confirming the people in
that league consent to appearing.
