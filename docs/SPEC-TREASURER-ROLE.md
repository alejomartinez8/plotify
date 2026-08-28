# Feature Spec: Treasurer Role & Approval Workflow

> Status: Resolved — ready for implementation (see 12)
> Author: Claude (drafted from stakeholder notes)
> Related: TODO.md Phase 6 (proposed)

## 1. Business Context

Plotify currently has two roles: **Admin** (full CRUD on financial data) and
**Owner** (read-only view of their own lot plus collaborator management).
The community needs a third role, **Treasurer**, whose job is to validate
that every income (`Contribution`) and expense (`Expense`) entered into the
system is correct before it is considered final. This adds a lightweight
approval workflow on top of the existing cash management CRUD.

The Treasurer's job is intentionally narrow: like reconciling a bank
statement, they confirm whether a transaction actually happened and is
recorded correctly — nothing more. They never add, edit, or delete a
record themselves; that stays exclusively an Admin responsibility. Keeping
content changes in a single role's hands avoids a class of bugs/conflicts
where a record could be altered or disappear because two different roles
had write access to it.

## 2. Goals

1. A Treasurer signs in with Google OAuth using an email that has been
   pre-registered by an Admin (whitelist), the same login mechanism already
   used for everyone else.
2. The Treasurer reviews every income and expense entry and marks it as
   **Approved**, optionally leaving a note. This — plus reversing their own
   call via **Un-approve** — is the entire scope of what a Treasurer can do.
   They have no create, edit, or delete access to any record, ever.

> **Update (2026-08-28, post-launch):** the original design also had a
> **Reject** action (`pending → rejected`, required note, auto-resubmitted
> to `pending` on the next Admin edit). Removed on request, to keep the
> Treasurer↔Admin handoff simpler: a two-state workflow (`pending`/
> `approved`, reversible via Un-approve) is all that's kept. Any
> inconsistency the Treasurer finds is now resolved by talking to Admin
> directly rather than through an in-app rejection flow with its own note
> and resubmit cycle. Every mention of "Reject"/"Rejected" below is
> historical — read `approved`/`pending` wherever `rejected` appears.
3. Once a record is **Approved**, its `amount`, `type` and `date` become
   immutable for everyone, including Admin. `description` and — income
   only — `lotId` stay editable, but **only by Admin** (e.g. to fix a
   payment that was logged against the wrong lot after the fact); the
   Treasurer cannot touch either field. An approved record can never be
   deleted; the Treasurer must **Un-approve** it first, which hands it back
   to Admin as `pending`.
4. Every approval and un-approval is recorded with who did it and when, so
   the community can audit who validated (or reversed) a given transaction.

## 3. Out of Scope (this phase)

- Multi-step / multi-approver chains.
- Email or push notifications on approval events.
- Bulk-approve actions.
- A dedicated `/approvals` queue page — v1 ships with inline approve/
  unapprove controls in the existing income/expense tables.
- A Reject action — see the note under Goal 2.

## 4. Roles Recap

| Role | How it's granted today | Change in this spec |
|---|---|---|
| Admin | Email listed in `ADMIN_EMAILS` env var | No change |
| Owner | Authenticated user with `Lot.ownerEmail` matching their email | No change |
| **Treasurer** (new) | Email listed in a new DB-managed whitelist | New |

Role precedence when a user logs in: **Admin > Treasurer > Owner**. An email
should typically only occupy one role, but Admin takes priority if the same
email is ever listed in both places.

## 5. Data Model Changes

### 5.1 New model: `Treasurer` (email whitelist)

Stored in the database (not an env var) so Admins can add/remove treasurers
from the Admin panel without a redeploy — mirrors how `Collaborator` is
managed today.

```prisma
model Treasurer {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())

  @@map("treasurers")
}
```

### 5.2 Approval fields on `Contribution` and `Expense`

Both models get the same four new columns. Following the existing schema
convention (`type`, `category` are plain `String`, not native Prisma enums),
`approvalStatus` stays a `String` validated at the application layer with a
Zod enum (`"pending" | "approved"`), consistent with how `type` is already
handled in `contribution-actions.ts` / `expense-actions.ts`.

```prisma
model Contribution {
  id              Int       @id @default(autoincrement())
  lotId           String
  type            String
  amount          Int
  description     String
  date            DateTime  @default(now())
  receiptNumber   String?
  receiptFileId   String?
  receiptFileName String?
  receiptFileUrl  String?
  approvalStatus  String    @default("pending") // pending | approved
  approvalNote    String?
  approvedBy      String?
  approvedAt      DateTime?
  lot             Lot       @relation(fields: [lotId], references: [id])

  @@map("contributions")
}

model Expense {
  id              Int       @id @default(autoincrement())
  type            String
  amount          Int
  date            String
  description     String
  category        String
  receiptNumber   String?
  receiptFileId   String?
  receiptFileName String?
  receiptFileUrl  String?
  approvalStatus  String    @default("pending")
  approvalNote    String?
  approvedBy      String?
  approvedAt      DateTime?

  @@map("expenses")
}
```

### 5.3 New model: `ApprovalHistory` (audit trail)

`approvedBy`/`approvedAt`/`approvalNote` on the record only capture the
*current* state, which isn't enough once un-approval is allowed — an item
can be approved, un-approved, and re-approved by a different Treasurer over
time, and the community wants to audit that full history, not just the
latest snapshot. A small append-only log covers both income and expense
with one table:

```prisma
model ApprovalHistory {
  id             String   @id @default(uuid())
  recordType     String   // "contribution" | "expense"
  recordId       Int
  action         String   // "approved" | "unapproved"
  treasurerEmail String
  note           String?
  createdAt      DateTime @default(now())

  @@map("approval_history")
}
```

Every approve/unapprove server action writes one row here in addition to
updating the snapshot fields on the `Contribution`/`Expense` record. The
UI can show a small "history" icon per row (visible to Admin/Treasurer)
that lists these entries — who, what action, when, and the note — for
full transparency.

### 5.4 Migration & backfill

- Add the `treasurers` table and the four new columns via a normal Prisma
  migration.
- **Backfill existing rows** (everything created before this feature ships)
  with `approvalStatus = "approved"`. Otherwise every historical income and
  expense would suddenly appear as "Pending", creating a massive backlog for
  the Treasurer on day one. `approvedBy`/`approvedAt` can stay `null` for
  backfilled rows (there is no real treasurer to attribute them to) — the UI
  should treat a null `approvedBy` on an approved record as "approved
  before this feature existed."
- Records created **after** the migration ships default to `"pending"`.

> **Update (2026-08-28, post-deploy):** reversed on request. Applied
> directly against production with a manual, one-off SQL `UPDATE`
> (not tracked as a Prisma migration file, since it only ever needed to
> run once against the already-backfilled rows) — guarded by
> `approvedBy IS NULL` so it only touched rows nobody had actually
> validated yet — setting every backfilled row back to `"pending"` so
> the Treasurer reviews the full historical ledger too, not just new
> records. The backlog tradeoff described above was accepted. A fresh
> environment migrated from scratch never hits this case: the original
> backfill (5.4) only ever touches rows that exist *at migration time*,
> so an empty database has nothing to backfill in the first place.

## 6. Authorization Changes (`src/lib/auth.ts`)

- Extend `getUserRole()` to return `"admin" | "treasurer" | "owner" | null`.
  Add a `treasurer` check (query the new `Treasurer` table by email) between
  the existing `admin` and `owner` checks.
- Add `isTreasurer()`, mirroring `isAdmin()`.
- Add `requireTreasurer()`, mirroring `requireAdmin()`, for use in the new
  approve/unapprove server actions.
- Add `requireTreasurerManagement()` (Admin-only) guarding the new
  Treasurer-whitelist CRUD actions.

## 7. Permission Matrix

| Action | Admin | Treasurer | Owner |
|---|---|---|---|
| View all financial data | ✅ | ✅ | ✅ (existing, own lot + shared views) |
| Create income/expense | ✅ | ❌ | ❌ |
| Edit income/expense while `pending` (all fields) | ✅ | ❌ | ❌ |
| Edit `description` while `approved` | ✅ | ❌ | ❌ |
| Edit `lotId` while `approved` (income only) | ✅ | ❌ | ❌ |
| Delete income/expense (only while `pending`) | ✅ | ❌ | ❌ |
| Delete an `approved` record | ❌ (must be un-approved first) | ❌ | ❌ |
| Approve (`pending` → `approved`) | ❌ | ✅ | ❌ |
| **Un-approve** (`approved` → `pending`) | ❌ | ✅ | ❌ |
| Manage Treasurer whitelist | ✅ | ❌ | ❌ |

The Treasurer row has exactly two enabled actions in the whole system:
**Approve** and **Un-approve** — everything else is view-only. There is no
Reject; an inconsistency the Treasurer finds gets resolved by talking to
Admin directly, not through an in-app flow (see the note under Goal 2).
Concretely, `createContributionAction`/`createExpenseAction`,
`updateContributionAction`/`updateExpenseAction`, and
`deleteContributionAction`/`deleteExpenseAction` all stay guarded by the
existing `requireAdmin()` / `checkAdminAccess()` pattern, unchanged — no
new grant is added for Treasurer on any of them. This is actually simpler
than the previous draft: adding the approval workflow doesn't require
loosening any existing write-access check.

### 7.1 Deletion rule

A record can be deleted only while it is `pending` — i.e. never validated.
This covers the stated case of removing duplicates or data-entry mistakes
before they're certified. An `approved` record can **never** be deleted
directly, by anyone, including Admin: re-doing a validation that already
happened is exactly the wasted work this rule avoids. If an approval turns
out to be a mistake (e.g. the Treasurer approved the wrong row), the
Treasurer un-approves it first — that puts it back in `pending`, where
Admin can then delete or fix it as usual.

### 7.2 Why the Treasurer never touches record content

The Treasurer's role is deliberately limited to a yes/no call on each
transaction, like checking a bank statement line by line — did this
payment happen, is it recorded right, yes or no. They never create, edit,
or delete a record, including the description or note text on the record
itself (the approval note lives only in `ApprovalHistory`, not on the
record). This is a hard boundary, not a UI nicety: if the Treasurer could
also edit content, a record's field could change without going through the
Admin, making it hard to reason about who is responsible for what a record
says. A single writer for content (Admin) plus a single validator for
status (Treasurer) keeps the two concerns — "what does this record say"
and "was it verified" — cleanly separated, and rules out the record
"disappearing" or drifting because two roles both had edit rights.

Approve/Un-approve are Treasurer-exclusive for the same reason: the
Treasurer is the sole party who certifies a transaction, so only the
Treasurer can also *reverse* that certification. Admin cannot approve or
un-approve — letting Admin do so would defeat the purpose of having an
independent validator. Admin keeps full control over content
(create, edit while unapproved or approved-but-non-locked fields, delete
while unapproved, manage the whitelist), Treasurer keeps full control over
validation status, and neither role can do the other's job.

## 8. Approval Workflow (state machine)

```
              create (Admin)
                   |
                   v
              [ pending ] <-----------------------------+
                   |                                     |
        Treasurer  |approve                    Treasurer |
                   |                            unapprove |
                   v                                     |
             [ approved ] ------------------------------>+
```

Two states, two Treasurer-exclusive actions between them — no Reject, no
resubmit cycle (see the note under Goal 2).

- **pending → approved**: Treasurer action. Note is optional. Writes an
  `ApprovalHistory` row (`action: "approved"`).
- **approved → pending** ("Un-approve"): Treasurer-only action (Admin
  cannot do this — see 7.2). Clears `approvedBy`/`approvedAt` on the
  record and writes an `ApprovalHistory` row (`action: "unapproved"`,
  note recommended). Once back in `pending`, the record can be edited on
  all fields or deleted like any other pending record.
- **approved (no status change)**: `amount`, `type` and `date` become
  immutable for everyone. `description` (and, for income, `lotId`) remain
  editable by **Admin only** — the Treasurer has no edit access at any
  status — without changing `approvalStatus`. The record also cannot be
  deleted while in this state (7.1).

## 9. UI/UX Changes

### 9.1 Tables (`IncomeReceiptTable`, `ExpenseTable`)

- New **Status** column with a badge: `Pendiente` (gray/amber) or `Aprobado`
  (green, check icon).
- The action column becomes role-specific, driven by a new `isTreasurer`
  prop alongside the existing `isAdmin` prop:
  - **Admin** keeps today's Edit/Delete icons, with Edit disabled on locked
    fields and Delete hidden once `approved` (per 7.1).
  - **Treasurer** sees a completely different action set: inline
    **Approve** (✓, note optional) on rows that are `pending`, and
    **Un-approve** (an "undo" icon) on rows that are `approved`. The
    Treasurer never sees an Edit or Delete icon — that column simply
    doesn't render write actions for this role (7.2).
- A status filter (`All / Pending / Approved`) helps the Treasurer find
  their review queue quickly within the existing pages.
- When Admin opens the edit form for an `approved` record, the
  `amount`/`type`/`date` fields render as read-only/disabled; `description`
  stays editable, and — income form only — `lotId` also stays editable.
  Delete is hidden/disabled for `approved` rows. The Treasurer never opens
  this form at all.
- A small **history** icon per row (visible to Admin/Treasurer, read-only)
  opens the `ApprovalHistory` entries for that record: who approved or
  un-approved it, when, and their note — the audit trail from 5.3.

### 9.2 Treasurer whitelist management (Admin panel)

- New section under `/admin` to add/remove Treasurer emails (+ optional
  display name), the same pattern as the existing Collaborator management
  UI.

### 9.3 Navigation

- Treasurer gets the same navigation as Owner (dashboard, income, expenses,
  lots — read views) plus the inline approve/unapprove controls on the
  income and expense tables. No new nav item is required for v1 since approval
  happens inline; a dedicated `/approvals` queue page (listing all pending
  items across income+expense in one place) is a good fast-follow if the
  inline queue proves hard to scan once volume grows.

## 10. Server Actions

New file `src/lib/actions/approval-actions.ts` (or added to the existing
`contribution-actions.ts` / `expense-actions.ts`):

- `approveContributionAction(id, note?)`
- `unapproveContributionAction(id, note?)`
- `approveExpenseAction(id, note?)`
- `unapproveExpenseAction(id, note?)`

Each guarded by `requireTreasurer()` — no other role may call these — and
each writes one `ApprovalHistory` row (5.3) in the same transaction as the
status update. None of them touch `description`, `lotId`, `amount`,
`type`, or `date`; they only write `approvalStatus`, `approvalNote`,
`approvedBy`, `approvedAt`, and the history row.

Changes to existing actions (still Admin-only via the existing
`requireAdmin()` / `checkAdminAccess()` guard — that guard itself doesn't
change, only the logic inside does):

- `updateContributionAction`: load the current record first. If
  `approvalStatus === "approved"`, reject the request unless only
  `description` and/or `lotId` differ from the stored values — return a
  validation error if `amount`, `type`, or `date` were changed.
- `updateExpenseAction`: same as above, except only `description` is
  allowed to change while `approved` (Expense has no `lotId`).
- `deleteContributionAction` / `deleteExpenseAction`: return an error if
  `approvalStatus === "approved"` (see 7.1) — deletion is only ever allowed
  for `pending` records.

## 11. Translations (`src/lib/translations.ts`)

- `labels`: `status`, `pending`, `approved`, `approvalNote`, `treasurer`,
  `approvedBy`, `approvalHistory`
- `actions`: `approve`, `unapprove`, `viewHistory`
- `messages`: `approvedSuccess`, `unapprovedSuccess`
- `errors`: `treasurerAccessRequired`, `cannotEditApprovedField`,
  `cannotDeleteApproved`

## 12. Open Questions — Resolved

All open questions from earlier drafts are now settled:

- Deletion rule: 7.1 (approved records are never deletable, must be
  un-approved first).
- No dedicated approvals page for v1: 3.
- Approve/Un-approve are Treasurer-exclusive, Admin has no content
  access on approved records beyond `description`/`lotId`: 7.2.
- Audit scope stays intentionally minimal: `ApprovalHistory` logs only the
  two explicit Treasurer actions (`approved` / `unapproved`). (This point
  originally also covered the `rejected → pending` auto-resubmit not
  getting its own history row — moot now that Reject was removed
  entirely; see the note under Goal 2.)

## 13. Suggested TODO.md Entry

```
### 🚧 Phase 6: Treasurer Role & Approval Workflow

- [ ] DB: Treasurer + ApprovalHistory models, approval fields migration
      (with backfill)
- [ ] Auth: treasurer role detection + requireTreasurer() guard
- [ ] Server actions: approve/unapprove actions (writing ApprovalHistory
      rows); lock approved records' amount/type/date in update actions;
      block delete while approved
- [ ] UI: status badges, approve/unapprove controls, and a history view
      on income/expense tables
- [ ] Admin panel: Treasurer whitelist management
- [ ] Translations for the new labels/actions/messages/errors
- [ ] End-to-end test: create → pending → approve → locked-field edit is
      denied → unapprove → pending → delete succeeds
```
