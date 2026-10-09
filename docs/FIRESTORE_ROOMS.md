# Co-op rooms: Firestore setup

Hollowmere's local co-op works like a lobby, all inside the game:
- A player (the **host**: TV, phone or computer) opens a room: **Co-op → Open a room**.
- A friend on a phone starts the game, picks **Join a friend** on the title screen and chooses the room from the list.
- The host sees "X wants to join. Accept?" and accepts. The phone becomes a controller (joystick + buttons).

Nobody types or copies anything. Firestore only introduces the two devices (a room document and one join request,
both deleted right after); the game traffic then goes directly between the devices on the Wi-Fi.

## Firestore layout

```
rooms/{room}            name, exp               the open room; its host refreshes exp every 15 s (it is gone ~45 s after the host stops)
rooms/{room}/reqs/{req} name, offer, exp,       a phone asking to join; the host writes `answer` (accept) or `no` (decline)
                        [answer | no]
```

## One-time setup

### 1. Publish the rules
Everything not listed in `firebase/firestore.rules` is closed, so the lobby needs its own block. In the
`imad-os/g` repository add this inside `match /databases/{database}/documents { ... }`, **above** the final
`match /{document=**}` block, then **Publish** (Firebase console → Firestore → Rules):

```
    // Local co-op lobby (apps with a phone as a controller, e.g. Hollowmere): a host opens a room, phones ask to join,
    // the host answers. Rooms live ~45 s unless the host keeps refreshing `exp`. Set TTL policies on `exp` (see below).
    match /rooms/{room} {
      allow get: if true;
      allow list: if request.query.limit <= 30;
      allow create: if room.matches('^[a-z0-9]{12}$')
          && request.resource.data.keys().hasOnly(['name', 'exp'])
          && request.resource.data.name is string && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 24
          && request.resource.data.exp is timestamp && request.resource.data.exp > request.time
          && request.resource.data.exp <= request.time + duration.value(2, 'm');
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['exp'])
          && request.resource.data.exp > request.time && request.resource.data.exp <= request.time + duration.value(2, 'm');
      allow delete: if true;

      match /reqs/{req} {
        allow get: if true;
        allow list: if request.query.limit <= 10;
        allow create: if req.matches('^[a-z0-9]{12}$')
            && request.resource.data.keys().hasOnly(['name', 'offer', 'exp'])
            && request.resource.data.name is string && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 24
            && request.resource.data.offer is string && request.resource.data.offer.size() <= 6000
            && request.resource.data.exp is timestamp && request.resource.data.exp > request.time
            && request.resource.data.exp <= request.time + duration.value(5, 'm');
        // the host answers once: `answer` (accept) or `no` (decline)
        allow update: if !('answer' in resource.data) && !('no' in resource.data)
            && ((request.resource.data.diff(resource.data).affectedKeys().hasOnly(['answer'])
                  && request.resource.data.answer is string && request.resource.data.answer.size() <= 6000)
                || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['no']) && request.resource.data.no == true));
        allow delete: if true;
      }
    }
```

### 2. TTL policies (Firestore cleans up abandoned rooms)
Firebase console → Firestore → **TTL** → create two policies on the timestamp field `exp`: collection group
`rooms`, and collection group `reqs`.

### 3. Firebase settings in the game
`js/firebase-config.js` holds the Firebase `project` id and web `apiKey` (Firebase console → Project settings →
Your apps). A web config is an identifier, not a secret; the rules above protect the data. While it is empty the
Co-op screens say "Firebase settings are missing".

## What the rules allow (and do not)
- Anyone can list open rooms (max 30), read a room and its requests, and open rooms or ask to join; nobody can reach any other collection.
- A room has only a name and an expiry; a request has a name, a connection offer (about 600 bytes) and an expiry. Sizes are capped.
- A request can be answered once. Anyone could still delete or answer somebody else's room: this is a casual
  friends-and-family lobby, not a place for secrets. A stranger could also fill the collection with junk; TTL clears it,
  and Firebase App Check is the next step if that ever happens.
- The room list is global: players who also run the game elsewhere see each other's rooms (names only). Joining only
  works on the same Wi-Fi, because the devices connect directly without any relay.
