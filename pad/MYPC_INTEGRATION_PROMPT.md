# Prompt for the My PC chat: adopt the virtual pad

Paste everything inside the block into the Claude session that works on the `imad-os/g` (My PC) repository.

````
TASK: adopt the standalone "virtual pad" (touch gamepad) into My PC, so every app/game can have customizable touch controls
without writing any UI. The pad is already written, documented and tested in my repository; use it, do not rewrite it.

SOURCE (public repo, read it first)
  github.com/imad-os/g_rpg   folder pad/
    pad/virtual-pad.js              the library (one file, no dependencies, ES5, runs on Chromium 108)
    pad/README.md                   full docs: options, API, what the player can customize
    pad/demo.html                   a small demo using onAction (open on a phone or add ?pad=1)
    pad/MYPC_INTEGRATION_PROMPT.md  this prompt
  Raw: https://raw.githubusercontent.com/imad-os/g_rpg/main/pad/virtual-pad.js
  Copy the file INTO the My PC repo (do not load it from my repo at runtime), keep its header comment, and note the
  source and version (1.0.0) so it can be updated later. Fetch the latest pad/README.md and follow it.

WHAT IT GIVES YOU
  A joystick + buttons that the PLAYER customizes with a gear button: add/hide buttons (from a catalog), resize the stick and
  buttons, drag them anywhere, reset. Saved per device in localStorage under "vpad:<id>". 4 languages (en/fr/es/ar, RTL aware).
  Multi-touch, no page zoom/scroll while shown. API: VirtualPad.init(opt), .hide(), .openSettings(), .active(), .version.
  Input delivery: keyboard events (default), opt.send(keyCode, down), or opt.onAction(action, down) for buttons that have an
  `action` (the stick sends 'left' 'right' 'up' 'down', the pause button sends 'pause'). Use onAction in My PC.

WHAT I WANT IN MY PC

1. SHELL TOUCH CONTROLS (the main goal)
   When My PC runs on a touch device (the phone/tablet app or a touch browser), draw the pad ABOVE the app's iframe for every
   app/game, in the shell, and feed it into the same input path as the gamepad/remote (the 'input' message to the app, dev 'keys'
   or a new 'touch' device). Use onAction. Games need no change.
   - Map actions to the SDK actions: left right up down, 'pause' (open My PC's pause menu), and for the buttons use the
     documented SDK actions: 'ok' (send BOTH confirm and jump, like the remote's OK), 'run', 'cancel', 'menu' (only for apps
     that init with ownMenu: true; otherwise it opens the pause menu).
   - Default buttons when the manifest says nothing: A = ok, B = run, with C = cancel and a menu button available in the catalog.
   - Let an app describe its touch controls in mypc-app.json (all optional):
       "touch": { "buttons": [ { "label": "A", "action": "ok" }, { "label": "B", "action": "run" } ],
                  "catalog": [ ...every button the player may add... ], "scale": { "stick": 1.0, "btn": 1.0 } }
       "touch": false   // the app has its own touch UI: do not draw the pad
     Validate it like the other manifest fields (labels <= 3 characters, known actions only, at most 8 catalog entries).
   - The layout is saved per app: use id = the app id ("vpad:<appId>").
   - Add a "Touch pad settings" item to My PC's pause menu (only on touch devices, only for apps that show the pad) that calls
     VirtualPad.openSettings(). Hide the pad while My PC's own screens (pause menu, multiplayer screens, dialogs) are open.
   - Never show the pad on the TV (no touch) unless ?pad=1 style debugging; keep it off when a gamepad is the active input.

2. SDK (apps running standalone in a browser, and apps that want a custom pad)
   Bundle the pad into the SDK as MyPC.pad (same API as VirtualPad) so a developer does not need a second file:
       MyPC.init({ ..., pad: true })                 // or pad: { buttons: [...], catalog: [...], scale: {...} }
   In standalone mode on a touch device it shows the pad with the SDK's own actions (call the internal input function directly,
   no fake keyboard events). Apps can also call MyPC.pad.init({ id, onAction | send, buttons, catalog, scale, force: true }) and
   MyPC.pad.hide() themselves: I use this for a phone that is only a controller in multiplayer (it sends the keys over
   MyPC.multiplayer instead of pressing them). Keep MyPC.apiLevel semantics: bump it, and MyPC.pad is undefined on older SDKs.

3. DOCS
   - GUIDE.md: a "Touch controls" section: what the shell shows by default, the manifest "touch" field, the pause-menu entry,
     MyPC.pad API for apps (init options, onAction/send, hide, openSettings), that layouts are saved per device, and an advice
     "do not build your own touch pad; if you do, set touch: false".
   - Add a line to the checklist: "playable on a phone with the touch pad (or your own with touch: false)".
   - Put the library's own docs next to the copied file (sdk/pad/README.md = pad/README.md from my repo) and credit the source.
   - Update sdk/example to show the pad in a phone (manifest "touch" + a tiny onAction-free usage, since the shell handles it).

4. TESTS
   Phone viewport (844x390 and 390x844) with touch: stick moves, buttons hold, multi-touch works, customization saves and survives
   a reload, "touch": false hides it, the pad does not show on a desktop mouse browser unless forced, pad is hidden while the
   pause menu is open, input reaches the app as the right SDK actions.

DO NOT: rewrite the pad's behavior, remove the customization panel, fetch the file from my repo at runtime, or show the pad
over the TV UI. If something in the library must change for My PC (names, actions), make the change in your copy AND tell me
exactly what, so I can update my repo's pad/ folder to match.

DONE WHEN: a game with no touch code is playable on a phone in My PC with a customizable pad; docs and example are updated;
you tell me the new manifest field and MyPC.pad API, so I can switch Hollowmere to them (its controller screen already uses
the pad with send, and its host pad with the same options).
````
