/* Hollowmere AI proxy: a tiny Cloudflare Worker that keeps your Gemini key secret.
 *
 * Setup (free plan is enough):
 *   1. Cloudflare dashboard -> Workers & Pages -> Create -> "Hello World" worker, paste this file.
 *   2. Settings -> Variables and secrets:
 *        GEMINI_KEY      (secret)  your key from https://aistudio.google.com/apikey
 *        ALLOWED_ORIGIN  (text)    https://<your-user>.github.io
 *   3. Deploy, then in the My PC installer open this app's Config and set
 *        { "proxyUrl": "https://<worker-name>.<you>.workers.dev" }
 *
 * Two kinds of requests:
 *   - chat: the normal Gemini generateContent body plus a "model" field (answer length capped);
 *   - { kind: "tts", model, text, voice, style }: speech for one dialogue line, answered as
 *     { audio: "<base64 WAV>" }. Text is capped at 600 characters.
 * Only the models below are accepted, so the key can't be used for anything else.
 */
const MODEL = 'gemini-3.5-flash-lite';
const TTS_MODELS = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
const API = 'https://generativelanguage.googleapis.com/v1beta/';

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
        const json = (obj, status) => new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, cors) });
        const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY };

        if (body.kind === 'tts') {
            const model = TTS_MODELS.indexOf(body.model) >= 0 ? body.model : TTS_MODELS[0];
            const text = String(body.text || '').slice(0, 600).trim();
            const voice = /^[A-Za-z]{2,20}$/.test(body.voice || '') ? body.voice : 'Kore';
            const style = String(body.style || '').slice(0, 120);
            if (!text) return json({ error: 'empty text' }, 400);
            const res = await fetch(API + 'interactions', {
                method: 'POST', headers,
                body: JSON.stringify({
                    model,
                    input: [{ type: 'user_input', content: [{ type: 'text', text, annotations: style ? [{ type: 'speech_metadata', style }] : [] }] }],
                    response_format: { type: 'audio' },
                    generation_config: { speech_config: [{ voice }] }
                })
            });
            if (!res.ok) return json({ error: 'tts ' + res.status }, 502);
            const out = await res.json();
            let audio = null;
            for (const step of out.steps || []) if (step.type === 'model_output') for (const c of step.content || []) if (c.type === 'audio' && c.data) audio = c.data;
            return audio ? json({ audio }) : json({ error: 'no audio' }, 502);
        }

        if (body.model && body.model !== MODEL) return new Response('Model not allowed', { status: 400, headers: cors });
        delete body.model;
        body.generationConfig = Object.assign({}, body.generationConfig, { maxOutputTokens: 300 });

        const res = await fetch(API + 'models/' + MODEL + ':generateContent', { method: 'POST', headers, body: JSON.stringify(body) });
        return new Response(res.body, { status: res.status, headers: Object.assign({ 'Content-Type': 'application/json' }, cors) });
    }
};
