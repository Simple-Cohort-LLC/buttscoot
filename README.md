# BUTTSCOOT GP 🏁

A Mario Kart-style browser racing game where jiu-jitsu players **butt-scoot**
around tatami-mat tracks — and settle collisions with real grappling matches.

- **Mode 7-style renderer** (SNES kart vibes): behind-the-driver camera, chunky
  pixels, gym-wall horizon, minimap
- **Random BJJ character** on every load — spazzy white belts, guard pullers,
  leg lockers, coral-belt coaches
- **Bump a rival → GRAPPLING MATCH**: the race pauses for a 1-minute round on a
  position ladder (guard → side control → mount). Sweep, advance, or hunt the
  submission — any tap ends it instantly
- **Items**: grab gear bags on the track — 🥋 Flow Roll (bump rivals without
  triggering a match), 🍓 Açaí Bowl (clears daze + speed burst), 💦 Mystery Mat
  Puddle (drop it behind you, gross). SPACE to use; trailing racers get better luck
- **Claude-powered extras** (optional): AI-generated characters, personality-matched
  trash talk during matches, and a ringside announcer recap after every race

Controls: `↑` scoot · `←/→` steer · `↓` brake (WASD works too). In a match:
`A` advance · `S` sweep · `D` defend · `F` submit · `G` gloat. Desktop only —
your thumbs can't butt scoot.

## Run locally

No build step, no dependencies:

```sh
python3 server.py
# → http://localhost:4173
```

To enable the AI features locally, pass an Anthropic API key:

```sh
ANTHROPIC_API_KEY=sk-ant-... python3 server.py
```

`server.py` serves `public/` and proxies `/api/claude` to Anthropic so the key
never reaches browser code.

## Deploy (Cloudflare Workers)

The repo is a Cloudflare Worker with static assets: the game in `public/`, the
API proxy in `src/worker.js`. Connect the GitHub repo in the Cloudflare
dashboard (Workers & Pages → Create → connect to Git) — the default
`npx wrangler deploy` build command just works — or deploy from your machine:

```sh
npx wrangler login
npx wrangler deploy
npx wrangler secret put ANTHROPIC_API_KEY   # optional — enables AI features
```

(In the dashboard, the secret lives under the Worker's Settings → Variables and
Secrets.) Without the secret, the game runs fine with its built-in roster and
scripted commentary.

**Cost note:** a public deployment with a key means your account pays for every
visitor's AI calls. Bind a KV namespace named `RATE_LIMIT` (see `wrangler.toml`)
to cap each IP at 200 AI calls/day, and consider keeping the secret unset until
you have real limits or accounts.

## Project layout

```
public/            the game (index.html, style.css, game.js) — no build step
src/worker.js      Cloudflare Worker: /api/status, /api/claude, asset fallthrough
server.py          local dev server + Claude proxy (mirrors the Worker)
wrangler.toml      Cloudflare Workers config
```

## License

TBD — all code is original; fonts (Bungee, Archivo, Chivo Mono) are SIL OFL via
Google Fonts.
