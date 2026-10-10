# Prompt for the My PC chat: pass the real controller buttons to apps

Hollowmere now shows and assigns buttons by their real names (A, B, X, Y, ✕, ○, □, △...). It reads `navigator.getGamepads()` itself, but inside the My PC player iframe the controller may not be visible (no focus), and the launcher only sends abstract actions (`jump`, `run`, `cancel`, `confirm`...).

Please add, without breaking the existing actions:

1. An SDK callback `MyPC.onButton(function (index, down, info) {})` where `index` is the physical button index of the Standard Gamepad mapping (0-15) and `info = { kind: 'xbox' | 'ps' | 'nintendo' | 'generic', id: gamepad.id }`. Fire it for every pad button the launcher already polls (including the ones it currently ignores: 4/5 bumpers, 6/7 triggers, 10/11 sticks).
2. Keep sending the abstract actions as today. Apps that use `onButton` can ignore the action that comes from the same physical press by checking `MyPC.padHeld()`, which returns `true` while any physical pad button is down.
3. Document it in `sdk/GUIDE.md` (input section) and the changelog.

Hollowmere will use it as a drop-in source for `js/gamepad.js` (`HM_PAD.poll`).
