// Cloudflare Pages Function: GET /api/status
// The game polls this on load to decide whether AI features are available.
export async function onRequest({ env }) {
  return new Response(JSON.stringify({ ai: Boolean(env.ANTHROPIC_API_KEY) }), {
    headers: { 'content-type': 'application/json' },
  });
}
