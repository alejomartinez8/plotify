# 📝 Plotify - TODO List

> **Current Focus:** System Maintenance & Code Quality
> **Production:** https://jalisco-travesias.vercel.app/

---

## Plotify Cash Management System - Production Ready

### ✅ Phase 1: Foundation - COMPLETED _(2025-01-25)_

- ✅ **Complete CRUD Operations** - Contributions, Expenses, Lots fully functional
- ✅ **Income type classification** - 3 types: Maintenance, Works, Others
- ✅ **Cash flow system** - Dynamic balance calculation (Contributions - Expenses)
- ✅ **Dashboard with consolidated balance** - Real-time financial overview
- ✅ **Google OAuth authentication** - Secure admin access
- ✅ **Production deployment** - Live on Vercel

### ✅ Phase 2: Quota & Debt Management System - COMPLETED _(2025-08-05)_

- ✅ **Complete quota system** - Maintenance and works quota management
- ✅ **Debt tracking** - Initial debt + automatic balance calculations
- ✅ **Dashboard integration** - Real-time quota status and balances
- ✅ **Admin interfaces** - Quota configuration and debt management

### ✅ Phase 3: Role-Based Access Control & Collaborator Management - COMPLETED _(2025-11-05)_

> **Business Context**: Multi-user authentication with role-based permissions
>
> - **Google OAuth Integration**: NextAuth v5 for secure authentication
> - **Role System**: Admin and Owner roles with different permission levels
> - **Access Control**: Owners can view all data but only edit/delete their own resources
> - **Collaborator Management**: Track workers assigned to lots with photo management
> - **Read-Only Views**: Owners have full visibility with restricted editing capabilities

#### ✅ **Authentication & Authorization**

- ✅ **NextAuth v5 Integration** - Modern authentication with Google OAuth provider
- ✅ **Role Management** - Admin vs Owner role determination via ADMIN_EMAILS
- ✅ **Middleware Protection** - Centralized auth check redirecting to /login
- ✅ **Session Management** - Secure session handling with role-based UI
- ✅ **Authorization Helpers** - `requireAdmin()`, `requireAllLotsAccess()`, `requireAnyLotAccess()`

#### ✅ **Owner Permissions**

- ✅ **Read-Only Access** - Owners can view ALL data (lots, contributions, expenses, collaborators)
- ✅ **Edit Restrictions** - Cannot create/edit/delete contributions, expenses, or lots
- ✅ **Collaborator Management** - Can edit/delete collaborators assigned to their lots only
- ✅ **UI Adaptation** - Edit/delete buttons hidden for non-editable resources
- ✅ **Server-Side Security** - All mutations protected with proper authorization checks

#### ✅ **Collaborator Module** _(2025-11-04)_

> **Business Context**: Track collaborators (workers) in each lot for labor management

- ✅ **Database Schema** - Collaborator and CollaboratorAssignment models (many-to-many)
- ✅ **Collaborator CRUD** - Full create, read, update, delete with role-based permissions
- ✅ **Photo Management** - Google Drive integration with thumbnail + enlarged view
- ✅ **Lot Assignment** - Multi-select checkbox interface for lot assignments
- ✅ **Permission Logic** - Owners can edit collaborators assigned to their lots
- ✅ **Search & Filter** - Search by name, filter by lot assignment
- ✅ **Collaborators Page** - Dedicated /collaborators route with full functionality

#### ✅ **Code Quality Improvements** _(2025-11-05)_

- ✅ **Internationalization** - Fixed hardcoded "Cuotas" text to use translations
- ✅ **Consistent Logging** - Replaced all console.log/error with logger service
- ✅ **Code Review** - Comprehensive pre-production review completed
- ✅ **Build Verification** - Production build passing without errors
- ✅ **TypeScript Strict** - No type errors or ESLint warnings

### ✅ Phase 4: Unified Income/Expense Categories (Cajas) - COMPLETED _(2026-08-01)_

- ✅ **Unified categories** - Expenses now use same types as contributions (maintenance/works/others)
- ✅ **Per-fund balance** - Dashboard shows income, expenses and balance for each fund category
- ✅ **Expense type filter** - Expense page now has type filter (maintenance/works/others)
- ✅ **TypeBadge on expenses** - Expense table shows fund type badge with color coding
- ✅ **DB migration** - Existing "general" expenses migrated to "others" type
- ✅ **Import/Export updated** - CSV correctly maps Spanish labels to enum values

### ✅ Phase 6: Treasurer Role & Approval Workflow - COMPLETED _(2026-08-28)_

> **Business Context**: A dedicated Treasurer role validates every income/expense
> entry, like reconciling a bank statement — confirming a transaction happened
> and is recorded correctly. Full design in `docs/SPEC-TREASURER-ROLE.md`.

- ✅ **Treasurer role** - New DB-managed email whitelist, admin-managed from `/admin` (the standalone `Treasurer` model was folded into the unified `User` model in Phase 7 below)
- ✅ **Approval workflow** - Two states, `pending` ↔ `approved`, with Treasurer-exclusive **Approve** and **Un-approve** (no Reject — kept intentionally simple; inconsistencies get resolved Treasurer↔Admin directly instead of an in-app rejection flow)
- ✅ **Validation-only role** - Treasurer can only approve/unapprove; never creates, edits, or deletes a record
- ✅ **Field locking** - Once approved, `amount`/`type`/`date` are immutable for everyone (incl. Admin); `description` (and `lotId` for income) stay Admin-editable
- ✅ **Deletion rule** - Approved records can never be deleted; must be un-approved first
- ✅ **Audit trail** - `ApprovalHistory` model logs every approve/unapprove with who, when, and an optional note; viewable per record
- ✅ **Backfill migration** - Existing income/expense records reset to `pending` (the original "default to approved" backfill was reversed with a one-off manual SQL fix against production, not a tracked migration) so the Treasurer reviews the full historical ledger too

### ✅ Phase 7: Consolidate Admin/Treasurer into a User table - COMPLETED _(2026-08-28)_

> **Business Context**: Admin was only assignable via the `ADMIN_EMAILS`
> env var (redeploy required); Treasurer had its own separate table. Full
> design in `docs/SPEC-USER-ROLES-CONSOLIDATION.md`.

- ✅ **Unified `User` model** - Single `users` table (`email`, `name`, `role`) replaces the standalone `Treasurer` model; migration copies any existing treasurers over with `role: 'treasurer'`
- ✅ **One admin screen for both roles** - `/admin` → Usuarios tab manages Admins and Treasurers together, no redeploy needed for either
- ✅ **`ADMIN_EMAILS` kept as a permanent safety net** - still grants Admin on its own, so the app can never lock every admin out even if the `users` table ends up empty
- ✅ **Owner stays derived, not stored** - `role` only ever holds `"admin"` or `"treasurer"`; Owner status keeps coming from `Lot.ownerEmail`, avoiding a second place that could drift out of sync
- ✅ **Self-removal guard** - an Admin can't delete their own `User` row from the UI or the server action; another admin has to

### ✅ Removed: Collaborator Management - COMPLETED _(2026-09-19)_

> **Business Context**: The Collaborator module (tracking workers assigned to
> lots with photo management) is no longer needed and has been removed
> entirely from the app.

- ✅ **Code removed** - `Collaborator`/`CollaboratorAssignment` Prisma models
  and DB migration, `/collaborators` page, `CollaboratorsView`,
  `CollaboratorCard`, `CollaboratorModal`, `PhotoViewModal`,
  `collaborator-actions.ts`, `database/collaborators.ts`,
  `types/collaborators.types.ts`, and their tests
- ✅ **Related cleanup** - Removed the now-unused `requireAnyLotAccess()` /
  `requireAllLotsAccess()` auth helpers, the `collaborator` upload type in
  `/api/upload` and `google-oauth-service.ts`, the nav link, and all
  collaborator-related translation keys

### ✅ Phase 9: Test Coverage - COMPLETED _(2026-09-19)_

> **Business Context**: The project had Vitest configured but only 8 test
> files, none covering money-handling logic, the permission system, CSV
> import/export, or most modals/hooks. Rolled out as one PR per phase to
> keep each review small.

- ✅ **Phase 1 — Financial logic** _(2026-09-19, [#114](https://github.com/alejomartinez8/plotify/pull/114))_:
  `balances.ts` (fund/monthly totals), `contribution-actions.ts`,
  `expense-actions.ts`, `quota-actions.ts`, `approval-actions.ts`, plus the
  untested CRUD/approval paths in `contributions.ts`, `expenses.ts`,
  `quotas.ts`
- ✅ **Phase 2 — Security & permissions** _(2026-09-19, [#116](https://github.com/alejomartinez8/plotify/pull/116))_:
  `auth.ts` role precedence (`ADMIN_EMAILS` safety net, DB role, derived
  Owner), `check-lot-access.ts`, `actions/helpers.ts`, `user-actions.ts`
  (self-lockout guards)
- ✅ **Phase 3 — Secondary data & import/export** _(2026-09-19, [#117](https://github.com/alejomartinez8/plotify/pull/117))_:
  `import-actions.ts` (CSV parsing, header validation, per-row errors),
  `export-actions.ts` (CSV formatting), `collaborators.ts`, `users.ts`,
  `approval-history.ts`
- ✅ **Phase 4 — Remaining components/hooks** _(2026-09-19)_: `QuotaModal`,
  `UserModal`, `CollaboratorModal`, `useReceiptUpload`; added a
  `ResizeObserver` stub to the shared test setup (needed by Radix
  `Checkbox`, used in `CollaboratorModal`)
- ✅ **Tooling** _(2026-09-19)_: added `@vitest/coverage-v8` with a minimum
  threshold (50% statements/lines, 65% branches, 60% functions over
  `src/lib/**`) and a GitHub Actions workflow
  (`.github/workflows/test.yml`) running lint + `npm run test:coverage`
  on every PR and push to `main`

### ✅ Bug Fixes

- ✅ **WhatsApp lot report drops works quotas** _(2026-09-24)_: the
  "current year only" filter hid works quotas (e.g. portón) and their
  payments from previous years. The year filter now applies only to
  maintenance quotas and non-works payments

---

## ⚡ **System Status**

### ✅ **Production Ready Features**

- ✅ **Complete cash management** - Full CRUD for contributions, expenses, lots
- ✅ **Quota & debt system** - Automated balance tracking and debt management
- ✅ **Google Drive integration** - Automatic receipt storage and organization
- ✅ **Admin panel** - CSV import/export, system management
- ✅ **Responsive design** - Mobile-first approach with excellent UX
- ✅ **Real-time calculations** - Dynamic balance and debt tracking
- ✅ **Role-based access control** - Admin and Owner roles with Google OAuth
- ✅ **Multi-user authentication** - Secure NextAuth v5 integration

### 🎯 **Current System Capabilities**

**For Admins:**
- Full CRUD operations on all resources (lots, contributions, expenses)
- CSV import/export for bulk operations
- Quota configuration and debt management
- User access control via ADMIN_EMAILS environment variable

**For Owners:**
- View all financial data (dashboard, contributions, expenses)
- View all lots and their details (read-only)
- No ability to modify financial data or create new records

**For Treasurers:**
- View all financial data, same as Owners
- Approve or un-approve any income/expense entry, with an optional note
- View the full approval audit trail (who validated what, and when) per record
- No ability to create, edit, or delete records — validation only

### 🚀 **Future Enhancements** (Not Prioritized)

- **Contact Management** - WhatsApp/email fields for communications
- **Bulk Operations** - Enhanced admin workflows
- **Analytics Dashboard** - Advanced reporting and insights

---

## 🔧 **Development Notes**

- **Development**: `npm run dev` for local development
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 with Google OAuth provider
- **Authorization**: Role-based (admin/treasurer/owner) — admin and treasurer via the `User` table managed from `/admin` (ADMIN_EMAILS env variable kept as a permanent recovery-only safety net for admin), owner derived from `Lot.ownerEmail`
- **File Storage**: Google Drive OAuth integration for receipts and photos
- **Logging**: Centralized logger service with structured logging
- **Code Quality**: TypeScript strict mode, ESLint, comprehensive error handling

---

_Last updated: 2026-09-19 - Collaborator management feature removed entirely._
