# Security Specification - Gym Audio HUD

## Data Invariants
1. A playlist must belong to a verified user.
2. A user can only read, create, update, or delete their own playlists.
3. Timestamps (`createdAt`, `updatedAt`) must be server-generated.
4. `ownerId` must match the authenticated user's UID and be immutable.
5. Playlist names must be strings with a maximum length.
6. A user's profile is only readable and writable by that specific user.

## The "Dirty Dozen" Payloads

### Playlist Collection Attacks
1. **Identity Spoofing**: Attempt to create a playlist with an `ownerId` that doesn't match the current user's UID.
2. **Resource Poisoning (ID)**: Attempt to create a playlist with a document ID larger than 128 characters.
3. **Ghost Field Injection**: Attempt to add an unmapped field like `is_admin: true` to a playlist document.
4. **Timestamp Fraud (Create)**: Attempt to set a manual `createdAt` string instead of `request.time`.
5. **Timestamp Fraud (Update)**: Attempt to update a document without updating `updatedAt` to `request.time`.
6. **Immutability Breach**: Attempt to change the `ownerId` of an existing playlist.
7. **Cross-User Read**: Authenticated User A tries to `get` or `list` User B's playlists.
8. **Cross-User Delete**: Authenticated User A tries to `delete` User B's playlist.
9. **Unverified Write**: A user with `email_verified: false` tries to create a playlist.
10. **State Corruption**: Attempt to set `tracks` to a non-array value.
11. **Value Poisoning**: Attempt to set `name` to a 2MB string.
12. **Orphaned Profile Read**: Attempt to read another user's profile data in `/users/{userId}`.

## Test Runner logic (Conceptual)
The `firestore.rules.test.ts` would verify these scenarios by asserting `PERMISSION_DENIED` for each.
