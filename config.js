/* Hollowmere: AI voices for the main characters (Maren, Tobin, Sela, Corvin).
 *
 * The game is fully playable without AI: quest dialogue is scripted, and the AI only adds free
 * conversation on top. To turn it on, fill in ONE of these:
 *
 *  - proxyUrl (recommended): the address of your own small proxy that keeps the Gemini key secret
 *    (see proxy/worker.js and the README). Example: 'https://hollowmere-ai.yourname.workers.dev'
 *  - geminiKey: a Gemini API key used directly from the browser. Anyone who opens the site can
 *    read it, so restrict it in Google AI Studio / Cloud Console (HTTP referrer = your Pages
 *    address, Generative Language API only) and set a low quota.
 */
window.HM_CONFIG = {
    proxyUrl: '',
    geminiKey: 'AIzaSyC6ueNqzsh3WVqNHCkX4MTmAHXrS0Pfxaw',
    model: 'gemini-3.5-flash-lite',
    timeoutMs: 3000
};
