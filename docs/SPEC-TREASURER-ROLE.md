# Feature Spec: Treasurer Role & Approval Workflow

> Status: Draft for review
> Author: Claude (drafted from stakeholder notes)
> Related: TODO.md Phase 6 (proposed)

## 1. Business Context

Plotify currently has two roles: **Admin** (full CRUD on financial data) and
**Owner** (read-only view of their own lot plus collaborator management).
The community needs a third role, **Treasurer**, whose job is to validate
that every income (`Contribution`) and expense (`Expense`) entered into the
system is correct before it is considered final. This adds a lightweight
approval workflow on top of the existing cash management CRUD.

## 2. Goals

1. A Treasurer signs in with Google OAuth using an email that has been
   pre-registered by an Admin (whitelist), the same login mechanism already
   used for everyone else.
2. The Treasurer reviews every income and expense entry and marks it as
   **Approved** or **Rejected**, optionally (Rejected: mandatorily) leaving
   a note explaining the validation outcome.
3. Once a record is **Approved**, its `amount`, `type` and `date` become
   immutable for everyone, including Admin. `description` stays editable,
   and — income only — `lotId` also stays editable (to fix a payment that
   was logged against the wrong lot after the fact). An approved record can
   never be deleted; the Treasurer must **Un-approve** it first.
4. Every approval, rejection and un-approval is recorded with who did it and
   when, so the community can audit who validated (or reversed) a given
   transaction.

## 3. Out of Scope (this phase)

- Multi-step / multi-approver chains.
- Email or push notifications on approval/rejection events.
- Bulk-approve actions.
- A dedicated `/approvals` queue page — v1 ships with inline approve/reject
  controls in the existing income/expense tables.

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
Zod enum (`"pending" | "approved" | "rejected"`), consistent with how
`type` is already handled in `contribution-actions.ts` / `expense-actions.ts`.

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
  approvalStatus  String    @default("pending") // pending | approved | rejected
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
  action         String   // "approved" | "rejected" | "unapproved"
  treasurerEmail String
  note           String?
  createdAt      DateTime @default(now())

  @@map("approval_history")
}
```

Every approve/reject/unapprove server action writes one row here in
addition to updating the snapshot fields on the `Contribution`/`Expense`
record. The UI can show a small "history" icon per row (visible to
Admin/Treasurer) that lists these entries — who, what action, when, and
the note — for full transparency.

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

## 6. Authorization Changes (`src/lib/auth.ts`)

- Extend `getUserRole()` to return `"admin" | "treasurer" | "owner" | null`.
  Add a `treasurer` check (query the new `Treasurer` table by email) between
  the existing `admin` and `owner` checks.
- Add `isTreasurer()`, mirroring `isAdmin()`.
- Add `requireTreasurer()`, mirroring `requireAdmin()`, for use in the new
  approve/reject server actions.
- Add `requireTreasurerManagement()` (Admin-only) guarding the new
  Treasurer-whitelist CRUD actions.

## 7. Permission Matrix

| Action | Admin | Treasurer | Owner |
|---|---|---|---|
| View all financial data | ✅ | ✅ | ✅ (existing, own lot + shared views) |
| Create income/expense | ✅ | ❌ | ❌ |
| Edit income/expense while `pending` or `rejected` (all fields) | ✅ | ❌ | ❌ |
| Edit `description` while `approved` | ✅ | ✅ | ❌ |
| Edit `lotId` while `approved` (income only) | ✅ | ✅ | ❌ |
| Delete income/expense (only while `pending` or `rejected`) | ✅ | ❌ | ❌ |
| Delete an `approved` record | ❌ (must be un-approved first) | ❌ | ❌ |
| Approve / Reject (`pending` → `approved`/`rejected`) | ❌ | ✅ | ❌ |
| **Un-approve** (`approved` → `pending`) | ❌ | ✅ | ❌ |
| Manage Treasurer whitelist | ✅ | ❌ | ❌ |

### 7.1 Deletion rule

A record can be deleted only while it is `pending` or `rejected` — i.e.
never validated, or validated-and-flagged-as-wrong. This covers the stated
case of removing duplicates or data-entry mistakes before they're
certified. An `approved` record can **never** be deleted directly, by
anyone, including Admin: re-doing a validation that already happened is
exactly the wasted work this rule avoids. If an approval turns out to be a
mistake (e.g. the Treasurer approved the wrong row), the Treasurer
un-approves it first — that puts it back in `pending`, where Admin can then
delete or fix it as usual.

### 7.2 Why approve/reject/un-approve are Treasurer-exclusive

Approval is a trust boundary: the Treasurer is the sole party who certifies
a transaction, so only the Treasurer can also *reverse* that certification.
Admin cannot un-approve — this is intentional, not an oversight — because
letting Admin undo a Treasurer's validation would defeat the purpose of
having an independent validator. Admin keeps full control everywhere else
(create, edit while unapproved, delete while unapproved, manage the
whitelist), so this is a narrow, deliberate carve-out.

## 8. Approval Workflow (state machine)

```
              create (Admin)
                   |
                   v
              [ pending ] <-----------------------------+
                   |               ^                     |
        Treasurer  |approve        | Treasurer            | Admin edits a
                   |               |unapprove              | rejected record
                   v               |                       | (auto-resubmit)
             [ approved ] ---------+                       |
                   |                                       |
        Treasurer  |reject (from pending, note required)   |
                   v                                       |
             [ rejected ] -----------------------------------+
```

- **pending → approved**: Treasurer action. Note is optional. Writes an
  `ApprovalHistory` row (`action: "approved"`).
- **pending → rejected**: Treasurer action. Note is **required** — it's the
  only way Admin knows what to fix. Writes an `ApprovalHistory` row
  (`action: "rejected"`).
- **rejected → pending**: automatic, the moment Admin saves an edit to a
  rejected record, so it re-enters the Treasurer's review queue.
- **approved → pending** ("Un-approve"): Treasurer-only action (Admin
  cannot do this — see 7.2). Clears `approvedBy`/`approvedAt` on the
  record and writes an `ApprovalHistory` row (`action: "unapproved"`,
  note recommended). Once back in `pending`, the record can be edited on
  all fields or deleted like any other pending record.
- **approved (no status change)**: `amount`, `type` and `date` become
  immutable for everyone. `description` (and, for income, `lotId`) remain
  editable by Admin or Treasurer without changing `approvalStatus`. The
  record also cannot be deleted while in this state (7.1).

## 9. UI/UX Changes

### 9.1 Tables (`IncomeReceiptTable`, `ExpenseTable`)

- New **Status** column with a badge: `Pendiente` (gray/amber), `Aprobado`
  (green, check icon), `Rechazado` (red, with the note visible on hover/click).
- For the Treasurer role, add inline **Approve** (✓) / **Reject** (✗)
  actions per row when status is `pending` or `rejected`. Reject opens a
  small note input (required); Approve allows an optional note.
- For the Treasurer role only, add an **Un-approve** action (e.g. an "undo"
  icon) on rows that are `approved`. Not shown to Admin (7.2). Clicking it
  asks for confirmation (this reopens the record for editing/deletion) and
  an optional note.
- A status filter (`All / Pending / Approved / Rejected`) helps the
  Treasurer find their review queue quickly within the existing pages.
- When Admin/Treasurer opens the edit form for an `approved` record, the
  `amount`/`type`/`date` fields render as read-only/disabled; `description`
  stays editable, and — income form only — `lotId` also stays editable.
  Delete is hidden/disabled for `approved` rows.
- A small **history** icon per row (visible to Admin/Treasurer) opens the
  `ApprovalHistory` entries for that record: who approved/rejected/
  un-approved it, when, and their note — the audit trail from 5.3.

### 9.2 Treasurer whitelist management (Admin panel)

- New section under `/admin` to add/remove Treasurer emails (+ optional
  display name), the same pattern as the existing Collaborator management
  UI.

### 9.3 Navigation

- Treasurer gets the same navigation as Owner (dashboard, income, expenses,
  lots — read views) plus the inline approve/reject controls on the income
  and expense tables. No new nav item is required for v1 since approval
  happens inline; a dedicated `/approvals` queue page (listing all pending
  items across income+expense in one place) is a good fast-follow if the
  inline queue proves hard to scan once volume grows.

## 10. Server Actions

New file `src/lib/actions/approval-actions.ts` (or added to the existing
`contribution-actions.ts` / `expense-actions.ts`):

- `approveContributionAction(id, note?)`
- `rejectContributionAction(id, note)` — note required by Zod schema
- `unapproveContributionAction(id, note?)`
- `approveExpenseAction(id, note?)`
- `rejectExpenseAction(id, note)`
- `unapproveExpenseAction(id, note?)`

Each guarded by `requireTreasurer()`, and each writes one `ApprovalHistory`
row (5.3) in the same transaction as the status update.

Changes to existing actions:

- `updateContributionAction`: load the current record first.
  - If `approvalStatus === "approved"`: reject the request unless only
    `description` and/or `lotId` differ from the stored values — return a
    validation error if `amount`, `type`, or `date` were changed.
  - If the record was `rejected` and the save succeeds: reset
    `approvalStatus` to `"pending"` and clear `approvedBy` / `approvedAt`.
- `updateExpenseAction`: same as above, except only `description` is
  allowed to change while `approved` (Expense has no `lotId`).
- `deleteContributionAction` / `deleteExpenseAction`: return an error if
  `approvalStatus === "approved"` (see 7.1) — deletion is only ever allowed
  for `pending` or `rejected` records.

## 11. Translations (`src/lib/translations.ts`)

- `labels`: `status`, `pending`, `approved`, `rejected`, `approvalNote`,
  `treasurer`, `approvedBy`, `approvalHistory`
- `actions`: `approve`, `reject`, `unapprove`, `viewHistory`
- `messages`: `approvedSuccess`, `rejectedSuccess`, `unapprovedSuccess`
- `errors`: `treasurerAccessRequired`, `rejectionNoteRequired`,
  `cannotEditApprovedField`, `cannotDeleteApproved`

## 12. Remaining Open Question

Everything from the previous round of open questions is now resolved
(deletion rule in 7.1, no dedicated approvals page per 3, un-approve is
Treasurer-only per 7.2, audit trail via `ApprovalHistory` per 5.3). One
smaller detail is still worth a quick call:

- Should the auto-resubmit (`rejected` → `pending` when Admin fixes and
  saves) also write an `ApprovalHistory` row (e.g. `action: "resubmitted"`),
  so the audit trail shows the full back-and-forth, not just the
  Treasurer's actions? *Default: yes — log it for completeness, since full
  transparency was explicitly called out as important (Goal 4).*

## 13. Suggested TODO.md Entry

```
### 🚧 Phase 6: Treasurer Role & Approval Workflow

- [ ] DB: Treasurer + ApprovalHistory models, approval fields migration
      (with backfill)
- [ ] Auth: treasurer role detection + requireTreasurer() guard
- [ ] Server actions: approve/reject/unapprove actions (writing
      ApprovalHistory rows); lock approved records' amount/type/date in
      update actions; block delete while approved
- [ ] UI: status badges, approve/reject/unapprove controls, and a history
      view on income/expense tables
- [ ] Admin panel: Treasurer whitelist management
- [ ] Translations for the new labels/actions/messages/errors
- [ ] End-to-end test: create → pending → approve → locked-field edit
      rejected, description/lot edit succeeds → unapprove → pending →
      delete succeeds
```
