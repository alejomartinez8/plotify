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
3. Once a record is **Approved**, its financial fields (amount, type, date,
   lot) become immutable for everyone, including Admin. Only the
   **description** may still be edited afterward.

## 3. Out of Scope (this phase)

- Multi-step / multi-approver chains.
- Email or push notifications on approval/rejection events.
- Bulk-approve actions.
- A full audit/history log beyond the single `approvedBy` / `approvedAt` /
  `approvalNote` snapshot stored on the record itself.

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

### 5.3 Migration & backfill

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
| Edit income/expense while `approved` (description only) | ✅ | ✅ | ❌ |
| Delete income/expense | ✅, only while not `approved` (see 7.1) | ❌ | ❌ |
| Approve / Reject | ❌ | ✅ | ❌ |
| Manage Treasurer whitelist | ✅ | ❌ | ❌ |

### 7.1 Deletion of approved records

Recommendation: once a record is `approved`, it cannot be deleted either —
not just value-locked. To delete it, a Treasurer must first **Reject** it
(which returns it to an editable state for Admin), keeping a single,
consistent lock mechanic instead of two separate ones for "edit" and
"delete."

### 7.2 Why Treasurer-only approval (not Admin too)

Keeping approval exclusive to the Treasurer preserves separation of duties
(the person entering the transaction is not also the one certifying it).
Admin retains full override power indirectly: Admin can always edit a
`rejected` record and the whitelist itself, so Admin is never blocked, just
not the one clicking "Approve."

## 8. Approval Workflow (state machine)

```
        create (Admin)
             |
             v
        [ pending ] <------------------------+
             |                                |
   Treasurer |approve         Treasurer       | Admin edits a
             |                |reject          | rejected record
             v                v                | (auto-resubmit)
       [ approved ]     [ rejected ] ----------+
             |
   Admin/Treasurer edit description only
   (approvalStatus unchanged)
```

- **pending → approved**: Treasurer action. Note is optional.
- **pending → rejected**: Treasurer action. Note is **required** — it's the
  only way Admin knows what to fix.
- **rejected → pending**: automatic, the moment Admin saves an edit to a
  rejected record. `approvedBy`/`approvedAt` are cleared so it re-enters the
  Treasurer's review queue.
- **approved**: `amount`, `type`, `date`, `lotId` become immutable for
  everyone. `description` remains editable by Admin or Treasurer without
  changing `approvalStatus`. The Treasurer may also update `approvalNote` at
  any time regardless of status (e.g., to add a clarifying comment after the
  fact).

## 9. UI/UX Changes

### 9.1 Tables (`IncomeReceiptTable`, `ExpenseTable`)

- New **Status** column with a badge: `Pendiente` (gray/amber), `Aprobado`
  (green, check icon), `Rechazado` (red, with the note visible on hover/click).
- For the Treasurer role, add inline **Approve** (✓) / **Reject** (✗)
  actions per row when status is `pending` or `rejected`. Reject opens a
  small note input (required); Approve allows an optional note.
- A status filter (`All / Pending / Approved / Rejected`) helps the
  Treasurer find their review queue quickly within the existing pages.
- When Admin/Treasurer opens the edit form for an `approved` record, the
  amount/type/date/lot fields render as read-only/disabled; only
  description (and, for Treasurer, the note) stay editable.

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
- `approveExpenseAction(id, note?)`
- `rejectExpenseAction(id, note)`

Each guarded by `requireTreasurer()`.

Changes to existing actions:

- `updateContributionAction` / `updateExpenseAction`: load the current
  record first.
  - If `approvalStatus === "approved"`: reject the request unless only
    `description` (and, for Treasurer, `approvalNote`) differs from the
    stored values — return a validation error otherwise.
  - If the record was `rejected` and the save succeeds: reset
    `approvalStatus` to `"pending"` and clear `approvedBy` / `approvedAt`.
- `deleteContributionAction` / `deleteExpenseAction`: return an error if
  `approvalStatus === "approved"` (see 7.1).

## 11. Translations (`src/lib/translations.ts`)

- `labels`: `status`, `pending`, `approved`, `rejected`, `approvalNote`,
  `treasurer`
- `actions`: `approve`, `reject`
- `messages`: `approvedSuccess`, `rejectedSuccess`
- `errors`: `treasurerAccessRequired`, `rejectionNoteRequired`,
  `cannotEditApprovedField`, `cannotDeleteApproved`

## 12. Open Questions (defaults proposed above, flag if you disagree)

1. Should approved records be undeletable, requiring a Reject first?
   *Default: yes (7.1).*
2. Is the inline approve/reject in the existing tables enough for v1, or is
   a dedicated `/approvals` queue page needed immediately? *Default: inline
   for v1, dedicated queue as fast-follow (9.3).*
3. Should backfilled historical records show "approved" with no
   `approvedBy`, or should we attribute them to a synthetic
   `"system-migration"` value? *Default: leave `approvedBy` null (5.3).*

## 13. Suggested TODO.md Entry

```
### 🚧 Phase 6: Treasurer Role & Approval Workflow

- [ ] DB: Treasurer model + approval fields migration (with backfill)
- [ ] Auth: treasurer role detection + requireTreasurer() guard
- [ ] Server actions: approve/reject actions; lock approved records in
      update/delete actions
- [ ] UI: status badges + approve/reject controls on income/expense tables
- [ ] Admin panel: Treasurer whitelist management
- [ ] Translations for the new labels/actions/messages/errors
- [ ] End-to-end test: create → pending → approve/reject → locked-field
      edit attempt is rejected → description-only edit succeeds
```
