// Buttscoot GP — Cloudflare Worker
// Serves /api/* (Claude proxy + status) and falls through to static assets.
// The API key is a Worker secret:  npx wrangler secret put ANTHROPIC_API_KEY
//
// Optional cost protection: bind a KV namespace named RATE_LIMIT (see
// wrangler.toml) and each IP gets DAILY_LIMIT AI calls per day.

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS_CAP = 1000;
const DAILY_LIMIT = 200;

const json = (status, obj) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/status') {
      return json(200, { ai: Boolean(env.ANTHROPIC_API_KEY) });
    }
    if (url.pathname === '/api/claude' && request.method === 'POST') {
      return handleClaude(request, env);
    }
    if (url.pathname.startsWith('/api/')) {
      return json(404, { error: 'not found' });
    }
    /* duel invite links are client-routed: /d/<code> serves the game
       (fetch "/" — asking assets for /index.html triggers a 307 that would
       strip the room code from the browser URL) */
    if (url.pathname.startsWith('/d/')) {
      return env.ASSETS.fetch(new Request(`${url.origin}/`, request));
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleClaude(request, env) {
  if (!env.ANTHROPIC_API_KEY) return json(503, { error: 'no ANTHROPIC_API_KEY set' });

  if (env.RATE_LIMIT) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const key = `rl:${ip}:${new Date().toISOString().slice(0, 10)}`;
    const used = parseInt((await env.RATE_LIMIT.get(key)) || '0', 10);
    if (used >= DAILY_LIMIT) return json(429, { error: 'daily AI limit reached' });
    await env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 86400 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json(400, { error: 'bad json' });
  }

  const payload = {
    model: MODEL,
    max_tokens: Math.min(parseInt(body.max_tokens, 10) || 400, MAX_TOKENS_CAP),
    messages: [{ role: 'user', content: String(body.prompt || '').slice(0, 6000) }],
  };
  if (body.system) payload.system = String(body.system).slice(0, 4000);

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    return json(502, { error: `anthropic ${r.status}`, detail: (await r.text()).slice(0, 500) });
  }
  const data = await r.json();
  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');
  return json(200, { text });
}
