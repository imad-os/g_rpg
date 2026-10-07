/* Hollowmere AI proxy: a tiny Cloudflare Worker that keeps your Gemini key secret.
 *
 * Setup (free plan is enough):
 *   1. Cloudflare dashboard -> Workers & Pages -> Create -> "Hello World" worker, paste this file.
 *   2. Settings -> Variables and secrets:
 *        GEMINI_KEY      (secret)  your key from https://aistudio.google.com/apikey
 *        ALLOWED_ORIGIN  (text)    https://<your-user>.github.io
 *   3. Deploy, then put the worker address in config.js -> proxyUrl.
 *
 * The game sends the normal Gemini generateContent body plus a "model" field. Only the
 * allowed model is accepted and the answer length is capped, so the key can't be abused
 * for anything else.
 */
const MODEL = 'gemini-3.5-flash-lite';

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const allowed = env.ALLOWED_ORIGIN || '';
        const cors = {
            'Access-Control-Allow-Origin': allowed || '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Vary': 'Origin'
        };
        if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
        if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });
        if (allowed && origin !== allowed) return new Response('Forbidden', { status: 403, headers: cors });

        let body;
        try { body = await request.json(); } catch (e) { return new Response('Bad JSON', { status: 400, headers: cors }); }
        if (body.model && body.model !== MODEL) return new Response('Model not allowed', { status: 400, headers: cors });
        delete body.model;
        body.generationConfig = Object.assign({}, body.generationConfig, { maxOutputTokens: 300 });

        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
            body: JSON.stringify(body)
        });
        return new Response(res.body, { status: res.status, headers: Object.assign({ 'Content-Type': 'application/json' }, cors) });
    }
};
