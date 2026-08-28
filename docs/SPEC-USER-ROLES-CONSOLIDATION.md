# Spec: Consolidate Admin/Treasurer into a `User` Table

> Status: Draft for review — do not implement until approved
> Author: Claude (drafted from stakeholder notes)
> Related: `docs/SPEC-TREASURER-ROLE.md` (the feature this consolidates)

## 1. Problem

Plotify currently determines a user's role through three unrelated
mechanisms:

| Role | Source of truth today |
|---|---|
| Admin | `ADMIN_EMAILS` environment variable (comma-separated) |
| Treasurer | `Treasurer` DB table (added in the treasurer-role feature) |
| Owner | Derived: authenticated email matches some `Lot.ownerEmail` |

This has two concrete costs:

1. **Assigning/removing an Admin requires a Vercel env var change and a
   redeploy** — the one thing the Treasurer table was specifically built
   to avoid for that role.
2. Two different code paths (env var parsing vs. a DB table) do the same
   job — check "is this email allowed to do X" — for what are, in this
   app, structurally identical roles.

With exactly three roles confirmed for the foreseeable future (Admin,
Treasurer, Owner) and Owner staying inherently tied to lot ownership (see
2.1), consolidating Admin and Treasurer into one `User` table removes the
redeploy dependency for both and gives Admin a single "Usuarios" screen to
manage every elevated permission instead of one tab per role.

## 2. Goals

1. Adding or removing an Admin or a Treasurer never requires a redeploy —
   both become rows in one DB table, managed from `/admin`.
2. One code path (`getUserRole()`) resolves a role from one table lookup
   instead of an env-var check plus a separate table query.
3. Keep a hard, config-level recovery path so the system can never lock
   every admin out of `/admin` (see 4.3).
4. Lay groundwork that makes a future identity-key change (e.g. adding
   phone-based login) a matter of extending one table, not touching three
   separate mechanisms.

### 2.1 Why Owner stays derived, not stored

An Owner isn't someone Admin explicitly promotes — they're whoever's email
happens to match a `Lot.ownerEmail`. Storing `role: "owner"` in the new
table would create a second place that has to agree with `Lot.ownerEmail`,
and the two would drift the moment a lot changes hands and someone forgets
to update both. So `User.role` only ever holds `"admin"` or `"treasurer"`;
Owner status keeps being computed from `Lot.ownerEmail`, exactly as today.

## 3. Data Model

### 3.1 New model: `User`

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      String   // "admin" | "treasurer"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

`role` stays a plain `String` (validated app-side with a Zod enum), matching
the existing schema convention — no native Prisma enum is used anywhere
else in this project (see `docs/SPEC-TREASURER-ROLE.md`, 5.2).

### 3.2 Removed: `Treasurer` model

Dropped. Its rows migrate into `User` with `role = 'treasurer'` (4.1).

### 3.3 Unaffected: `ApprovalHistory.treasurerEmail`

Stays a plain email string, not a foreign key to `User`. An audit entry
must keep showing who approved something even if that person is later
removed from `User` entirely — the same reasoning a git commit keeps its
author after they leave. No change needed here.

### 3.4 Unaffected: `Lot.ownerEmail`

Stays a plain string for this consolidation. Turning it into a
`Lot.ownerId` foreign key to `User` is a reasonable future step (and would
require giving every Owner a `User` row too, which is a bigger, separate
change — see 6), but it's not needed to solve the two problems in section
1 and is out of scope here.

## 4. Migration Plan

### 4.1 Schema migration

1. Create the `users` table.
2. Backfill: `INSERT INTO users (id, email, name, role, "createdAt") SELECT id, email, name, 'treasurer', "createdAt" FROM treasurers;` — a straight copy, done inside the SQL migration since it only reads from the DB itself.
3. Drop the `treasurers` table.

### 4.2 Seeding existing Admins

The current Admin list only exists in `ADMIN_EMAILS`, which a SQL migration
can't read. Two options:

- **(A) One-off script**: a `prisma/seed.ts`-style script run once during
  this deploy, fed the current `ADMIN_EMAILS` value, inserting one `User`
  row per email with `role = 'admin'`.
- **(B) Don't backfill at all** — see 4.3, where `ADMIN_EMAILS` keeps
  working forever as a parallel source, so there's nothing that strictly
  needs migrating on day one; existing admins keep working via the env
  var and can optionally be moved into the table later.

Recommendation: **(B)**, paired with 4.3 below — it's less migration
machinery and the safety net makes it fully optional rather than
time-pressured.

### 4.3 Keep `ADMIN_EMAILS` as a permanent safety net (recommended)

Rather than fully retiring `ADMIN_EMAILS`, keep checking it *in addition
to* the `User` table: an email is Admin if it's in `ADMIN_EMAILS` **or**
has `role = 'admin'` in `User`. This:

- Fully solves the stated problem — day-to-day admin/treasurer changes go
  through `/admin`, no redeploy.
- Gives a recovery path that doesn't depend on the database at all: if
  `users` ever ends up with zero admins (bad migration, accidental
  deletion, whatever), whoever owns the Vercel project can still get back
  in by setting `ADMIN_EMAILS` and redeploying — the exact tool that
  exists today, just demoted to "emergency only" instead of "the only
  way."
- Needs no extra business logic (no "can't delete the last admin" check
  to write and maintain) — the env var makes that scenario recoverable by
  construction.

The tradeoff: two sources of truth for Admin specifically (not Treasurer,
which has none today either). That's an acceptable, deliberate asymmetry —
Admin is the one role whose complete loss would otherwise be
unrecoverable without direct DB access.

## 5. Code Changes

### 5.1 `src/lib/auth.ts`

- `getUserRole()` precedence becomes: `ADMIN_EMAILS` → `User.role`
  (`admin` or `treasurer`) → `Lot.ownerEmail` match (`owner`) → `null`.
- `isTreasurerEmail()` is replaced by a general `getUserRoleRecord(email)`
  (or similar) that looks up `User` once and returns its `role`, used by
  both the admin and treasurer branches.
- `requireAdmin()` / `requireTreasurer()` keep their current signatures —
  only what they check under the hood changes.

### 5.2 Database layer

- `src/lib/database/treasurers.ts` → replaced by `src/lib/database/users.ts`:
  `getUsers()`, `createUser({ email, name, role })`, `updateUserRole(id, role)`,
  `deleteUser(id)`.

### 5.3 Server actions

- `src/lib/actions/treasurer-actions.ts` → generalized to
  `src/lib/actions/user-actions.ts`, admin-only, taking a `role` field
  (`"admin" | "treasurer"`) instead of being treasurer-only.

### 5.4 UI

- `src/components/admin/TreasurerManagement.tsx` → generalized to
  `UserManagement.tsx`: same list/add/remove UI, plus a role picker
  (Admin/Tesorero) on the add form and a role badge per row instead of a
  fixed "Tesorero" label.
- `AdminConfig.tsx`: the "Tesoreros" tab is renamed "Usuarios" and shows
  the combined list.
- Lightweight guard: an Admin cannot remove their own `User` row from the
  UI (must be done by another admin) — cheap to add, avoids an accidental
  self-lockout click even though 4.3's safety net makes it recoverable
  either way.

## 6. Explicitly Out of Scope (this pass)

- Turning `Lot.ownerEmail` into a `Lot.ownerId` FK / giving Owners their
  own `User` row. Only worth doing together with a real reason to touch
  every Owner record (e.g. the phone-auth migration below).
- Any change to how login works. `User.email` stays the identity key.
- Phone-number-based authentication. Flagged here only because it's the
  reason to build one `User` table now: if/when that happens, it becomes
  "add a nullable `phone` column to `User` and change the lookup key" —
  contained in one place — instead of reworking `ADMIN_EMAILS` parsing,
  `Treasurer.email`, and `Lot.ownerEmail` independently. That migration
  needs its own spec (different NextAuth provider, likely SMS OTP, real
  cost-per-message considerations) and isn't part of this change.

## 7. Open Questions

1. Confirm 4.3's recommendation: keep `ADMIN_EMAILS` permanently as a
   safety net, rather than a one-time seed to fully retire? *(Default:
   yes, permanent.)*
2. Ship this as a fast-follow PR after `docs/SPEC-TREASURER-ROLE.md`'s PR
   (#97) merges, or fold it into that same PR before it merges? *(Default:
   fast-follow — keeps the two changes reviewable independently, and #97
   is already open.)*
3. Any existing Treasurer accounts to seed as Admin too, or does 4.1's
   straight copy (all existing treasurers → `role: 'treasurer'`) cover
   everyone correctly?

## 8. Suggested TODO.md Entry

```
### 🚧 Phase 7: Consolidate Admin/Treasurer into a User table

- [ ] DB: User model; migrate treasurers → users (role: 'treasurer'); drop treasurers table
- [ ] Auth: getUserRole() reads ADMIN_EMAILS + User.role, Owner still derived from Lot.ownerEmail
- [ ] DB layer + server actions: users.ts / user-actions.ts (admin-only, role param)
- [ ] UI: AdminConfig "Usuarios" tab replacing "Tesoreros", with a role picker; guard against self-removal
- [ ] Translations for the generalized labels/actions
```
