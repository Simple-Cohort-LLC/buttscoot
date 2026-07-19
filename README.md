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
- **Claude-powered extras** (optional): AI-generated characters, personality-matched
  trash talk during matches, and a ringside announcer recap after every race

Controls: `↑` scoot · `←/→` steer · `↓` brake (WASD works too). In a match:
`1/2/3` or `←/↑/→` pick your technique.

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

## Deploy (Cloudflare Pages)

The repo is Pages-ready: static game in `public/`, API proxy in `functions/api/`.

```sh
npx wrangler login
npx wrangler pages deploy
npx wrangler pages secret put ANTHROPIC_API_KEY   # optional — enables AI features
```

Or connect the GitHub repo in the Cloudflare dashboard (build output directory:
`public`). Without the secret, the game runs fine with its built-in roster and
scripted commentary.

**Cost note:** a public deployment with a key means your account pays for every
visitor's AI calls. Bind a KV namespace named `RATE_LIMIT` (see `wrangler.toml`)
to cap each IP at 200 AI calls/day, and consider keeping the secret unset until
you have real limits or accounts.

## Project layout

```
public/            the game (index.html, style.css, game.js) — no build step
functions/api/     Cloudflare Pages Functions: /api/status, /api/claude
server.py          local dev server + Claude proxy (mirrors the Functions)
wrangler.toml      Cloudflare Pages config
```

## License

TBD — all code is original; fonts (Bungee, Archivo, Chivo Mono) are SIL OFL via
Google Fonts.
