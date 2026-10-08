/* Sets the version everywhere, as the My PC guide asks: every file index.html loads from this
 * site carries ?v=<version>, the same as "version" in mypc-app.json (TVs then never keep old files).
 *
 *     node tools/release.js 1.7.0
 *
 * Updates mypc-app.json, the <script>/<link> tags of index.html, and window.HM_VERSION (which the
 * game adds to the images and voice clips it loads from code). The SDK <script> is left alone. */
const fs = require('fs'), path = require('path');
const v = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(v || '')) { console.error('usage: node tools/release.js 1.2.3'); process.exit(1); }
const root = path.join(__dirname, '..');
const mf = path.join(root, 'mypc-app.json'), m = JSON.parse(fs.readFileSync(mf, 'utf8'));
m.version = v;
fs.writeFileSync(mf, JSON.stringify(m, null, 2) + '\n');
const hf = path.join(root, 'index.html');
let h = fs.readFileSync(hf, 'utf8');
h = h.replace(/(<script src="(?!https?:)[^"?]+)(\?v=[^"]*)?"/g, '$1?v=' + v + '"');
h = h.replace(/(<link [^>]*href="(?!https?:)[^"?]+)(\?v=[^"]*)?"/g, '$1?v=' + v + '"');
if (/window\.HM_VERSION = '[^']*'/.test(h)) h = h.replace(/window\.HM_VERSION = '[^']*'/, "window.HM_VERSION = '" + v + "'");
else h = h.replace('<script src="https://imad-os.github.io/g/sdk/mypc-sdk.js"></script>', "<script>window.HM_VERSION = '" + v + "';</script>\n<script src=\"https://imad-os.github.io/g/sdk/mypc-sdk.js\"></script>");
fs.writeFileSync(hf, h);
console.log('version ' + v + ' set in mypc-app.json and index.html');
