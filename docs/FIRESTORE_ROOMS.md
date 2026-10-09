# Co-op room codes: Firestore setup

Hollowmere's local co-op (a phone as the second controller) uses a short room code. The two devices
swap their connection data through one tiny Firestore document, `rooms/<CODE>`, which is deleted
right after. Game traffic then goes directly between the devices on the Wi-Fi; Firestore only
introduces them. Two things must be set up once.

## 1. Publish the rules (adds the `rooms` collection)

Everything not listed in `firebase/firestore.rules` is closed, so the rooms need their own block.
In the `imad-os/g` repository, add this inside `match /databases/{database}/documents { ... }` of
`firebase/firestore.rules`, **above** the final `match /{document=**}` block, then **Publish** the rules
(Firebase console → Firestore → Rules):

```
    // Local co-op rooms (apps that use a phone as a controller, e.g. Hollowmere): a device creates a room with a
    // 5-letter code and its WebRTC offer, the phone writes its answer once, then the room is deleted.
    // Codes are unguessable enough for a 3-minute window; there is no listing. Set a TTL policy on `exp`.
    match /rooms/{code} {
      allow get: if true;
      allow list: if false;
      allow create: if code.matches('^[A-HJ-NP-Z2-9]{5}$')
          && request.resource.data.keys().hasOnly(['offer', 'exp'])
          && request.resource.data.offer is string && request.resource.data.offer.size() <= 6000
          && request.resource.data.exp is timestamp
          && request.resource.data.exp > request.time
          && request.resource.data.exp <= request.time + duration.value(15, 'm');
      allow update: if !('answer' in resource.data)
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['answer'])
          && request.resource.data.answer is string && request.resource.data.answer.size() <= 6000;
      allow delete: if true;
    }
```

## 2. Let Firestore clean up abandoned rooms (TTL)

Firebase console → Firestore → **TTL** → *Create policy*: collection group `rooms`, timestamp field `exp`.
(Rooms the game does not delete itself, for example because the TV lost power, then disappear by themselves.)

## 3. Put your Firebase web config in the game

Fill in `js/firebase-config.js` with `project` (the Firebase project id) and `key` (the web `apiKey`) from
Firebase console → Project settings → Your apps. A web config is an identifier, not a secret; the rules above
are what protect the data. If it stays empty, the Co-op screen says the settings are missing.

## What the rules allow (and do not)

- Anyone who knows a code can read that room and write its answer once; nobody can list rooms or touch other collections.
- A room holds one string (the offer, about 600 bytes) and its expiry; it cannot be made larger than 6000 bytes.
- Anyone can create rooms, so a bored stranger could fill the collection with junk. TTL clears it; if it ever
  becomes a problem, add Firebase App Check.
