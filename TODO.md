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
- ✅ **Approval workflow** - `pending` → `approved`/`rejected`, with Treasurer-exclusive **Un-approve** to reverse a mistaken approval
- ✅ **Validation-only role** - Treasurer can only approve/reject/unapprove; never creates, edits, or deletes a record
- ✅ **Field locking** - Once approved, `amount`/`type`/`date` are immutable for everyone (incl. Admin); `description` (and `lotId` for income) stay Admin-editable
- ✅ **Deletion rule** - Approved records can never be deleted; must be un-approved first
- ✅ **Audit trail** - `ApprovalHistory` model logs every approve/reject/unapprove with who, when, and an optional note; viewable per record
- ✅ **Auto-resubmit** - A fixed `rejected` record automatically returns to `pending` when Admin saves an edit
- ✅ **Backfill migration** - Existing income/expense records reset to `pending` (a follow-up migration reversed the original "default to approved" backfill) so the Treasurer reviews the full historical ledger too

### ✅ Phase 7: Consolidate Admin/Treasurer into a User table - COMPLETED _(2026-08-28)_

> **Business Context**: Admin was only assignable via the `ADMIN_EMAILS`
> env var (redeploy required); Treasurer had its own separate table. Full
> design in `docs/SPEC-USER-ROLES-CONSOLIDATION.md`.

- ✅ **Unified `User` model** - Single `users` table (`email`, `name`, `role`) replaces the standalone `Treasurer` model; migration copies any existing treasurers over with `role: 'treasurer'`
- ✅ **One admin screen for both roles** - `/admin` → Usuarios tab manages Admins and Treasurers together, no redeploy needed for either
- ✅ **`ADMIN_EMAILS` kept as a permanent safety net** - still grants Admin on its own, so the app can never lock every admin out even if the `users` table ends up empty
- ✅ **Owner stays derived, not stored** - `role` only ever holds `"admin"` or `"treasurer"`; Owner status keeps coming from `Lot.ownerEmail`, avoiding a second place that could drift out of sync
- ✅ **Self-removal guard** - an Admin can't delete their own `User` row from the UI or the server action; another admin has to

### 🚧 Phase 8: Browser Notifications (Future Enhancement)

> **Note**: Browser notifications feature has been deprioritized. Current authentication system via Google OAuth meets business needs.
>
> **Reason**: The implemented role-based access control with Google OAuth provides:
> - ✅ Secure authentication without password management
> - ✅ Easy user onboarding (just add email to database)
> - ✅ Professional authentication flow
> - ✅ No need for custom notification infrastructure yet

**If needed in future:**

- [ ] **Browser Notification Infrastructure** - Service worker for payment reminders
- [ ] **Contact Management** - WhatsApp, email fields for multi-channel communication
- [ ] **Notification Preferences** - User settings for reminder frequency

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
- ✅ **Collaborator management** - Track workers with photo management
- ✅ **Multi-user authentication** - Secure NextAuth v5 integration

### 🎯 **Current System Capabilities**

**For Admins:**
- Full CRUD operations on all resources (lots, contributions, expenses, collaborators)
- CSV import/export for bulk operations
- Quota configuration and debt management
- User access control via ADMIN_EMAILS environment variable

**For Owners:**
- View all financial data (dashboard, contributions, expenses)
- View all lots and their details (read-only)
- View all collaborators
- Edit/delete collaborators assigned to their lots only
- No ability to modify financial data or create new records

**For Treasurers:**
- View all financial data, same as Owners
- Approve, reject, or un-approve any income/expense entry, with an optional/required note
- View the full approval audit trail (who validated what, and when) per record
- No ability to create, edit, or delete records — validation only

### 🚀 **Future Enhancements** (Not Prioritized)

- **Browser Notifications** - Payment reminders via web push
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

_Last updated: 2026-08-28 - Treasurer role, approval workflow, and Admin/Treasurer user-table consolidation completed. Phases 6-7 finished._
