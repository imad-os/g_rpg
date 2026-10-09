/* Hollowmere: the chapter loader. Each chapter is a pack of files (maps, story, texts, art) that is
 * loaded only while the heroes are in it: travelling to another chapter loads that pack and lets
 * go of the old one, like switching from one game to the next. See docs/CHAPTER_API.md.
 *
 * A chapter's main file ends with:   HM_CHAPTERS.def.ch2 = function (api) { return { ...hooks } };
 * Zone ids tell which chapter a zone belongs to: 'c2_...' is chapter 2, anything else chapter 1. */
window.HM_CHAPTERS = (function () {
    'use strict';
    // the files of each chapter, in load order (all with ?v=<version>)
    const LIST = {
        ch1: { files: ['js/maps.js', 'js/pool.js', 'js/rift.js', 'chapters/ch1/story.js'], home: 'village', globals: ['HM_MAPS', 'HM_POOL', 'HM_RIFT'] },
        ch2: { files: ['chapters/ch2/text.js', 'chapters/ch2/maps.js', 'chapters/ch2/art.js', 'chapters/ch2/chapter.js'], home: 'c2_bay', globals: ['HM_C2_MAPS', 'HM_C2_ART', 'HM_C2_POOL', 'HM_C2_TEXT'] }
    };
    const def = {}, loaded = {}, tags = {};

    function of(zone) { const m = /^c(\d+)_/.exec(zone || ''); return m ? 'ch' + m[1] : 'ch1'; }
    // chapters the owner switched on: app config "chapters" is a list like ["ch2", "ch3"]
    // (a text "ch2, ch3", numbers [2, 3] and "all" work too); chapter 1 is always there
    function enabled(id) {
        if (id === 'ch1') return true;
        const c = (window.MyPC && MyPC.app_config) || {};
        let v = c.chapters;
        if (v === undefined || v === null) return true;                   // not set: every chapter ([] or "none": chapter 1 only)
        if (!Array.isArray(v)) v = String(v).split(/[\s,]+/);
        v = v.map(k => String(k).trim().toLowerCase()).map(k => /^\d+$/.test(k) ? 'ch' + k : k);
        return v.indexOf(id) >= 0 || v.indexOf('all') >= 0;
    }
    function script(src) {
        return new Promise((ok, fail) => {
            const s = document.createElement('script');
            s.src = src + '?v=' + (window.HM_VERSION || '1');
            s.onload = () => ok(s); s.onerror = () => fail(new Error('could not load ' + src));
            document.body.appendChild(s);
        });
    }
    // load a chapter's files one after the other (they build on each other); resolves when ready
    async function load(id, progress) {
        if (loaded[id]) return def[id];
        const files = LIST[id].files; tags[id] = [];
        for (let i = 0; i < files.length; i++) { tags[id].push(await script(files[i])); if (progress) progress((i + 1) / files.length); }
        loaded[id] = true;
        return def[id];
    }
    // forget a chapter: its scripts, its globals and its hooks, so the browser can free them
    function unload(id) {
        if (!loaded[id]) return;
        for (const t of tags[id] || []) t.remove();
        for (const g of LIST[id].globals) { try { delete window[g]; } catch (e) { window[g] = undefined; } }
        delete def[id]; loaded[id] = false; tags[id] = [];
    }
    return { LIST, def, of, enabled, load, unload, isLoaded: id => !!loaded[id] };
})();
