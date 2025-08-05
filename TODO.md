# 📝 Plotify - TODO List

> **Current Focus:** Quota & Debt Management System Implementation  
> **Production:** https://jalisco-travesias.vercel.app/

---

## Plotify Cash Management System - Production Ready

### ✅ Phase 1: Foundation - COMPLETED

- ✅ **Complete CRUD Operations** - Contributions, Expenses, Lots fully functional _(2025-01-25)_
- ✅ **Income type classification** - 3 types: Maintenance, Works, Others _(2025-01-25)_
- ✅ **Cash flow system** - Dynamic balance calculation (Contributions - Expenses) _(2025-01-25)_
- ✅ **Dashboard with consolidated balance** - Real-time financial overview _(2025-01-25)_
- ✅ **Google OAuth authentication** - Secure admin access _(2025-01-25)_
- ✅ **Production deployment** - Live on Vercel _(2025-01-25)_
- [ ] **Initial balance setup** - Optional starting balance configuration
- [ ] **Production OAuth callback** - Update callback URL for deployed domain

### 🎯 Phase 2: Quota & Debt Management System - DETAILED IMPLEMENTATION PLAN

> **Business Context**: Sistema de cuotas con integración de datos existentes
> - **2024 Registered**: Aportes mantenimiento sep-dic ya en sistema (50.000/mes)
> - **2024 Excel Import**: Solo deudas iniciales de obras desde Excel
> - **2025 Config**: Mantenimiento 60.000/mes + obras especiales (300.000, 500.000)
> - **Integration**: Aprovecha aportes registrados + calcula balances automáticamente

#### 📋 **Implementation Tasks**

**Phase 2.1: Database Foundation (25 min)**
- [ ] **QuotaConfig Model** - Monthly maintenance & special works quotas by year/date
  ```prisma
  model QuotaConfig {
    id String @id @default(uuid())
    year Int
    month Int?
    quotaType String // "maintenance" | "works"
    amount Int
    description String?
    dueDate DateTime?
    isActive Boolean @default(true)
    createdAt DateTime @default(now())
  }
  ```
- [ ] **Update Lot Model** - Add initialWorksDebt field to existing Lot model
  ```prisma
  model Lot {
    id               String         @id @default(uuid())
    lotNumber        String         @unique
    owner            String
    initialWorksDebt Int            @default(0) // Initial works debt 2024
    contributions    Contribution[]
  }
  ```
- [ ] **Migration & Initial Data** - Configure 2024/2025 quotas

**Phase 2.2: Initial Debt Configuration (10 min)**
- [ ] **Manual Debt Setup** - `/admin/initial-debt` page with lot list and editable debt fields
- [ ] **Update Lot Actions** - Extend existing lot-actions.ts with initialWorksDebt updates
- [ ] **Simple UI** - Table with lot info and debt input field per row
- [ ] **Bulk Operations** - Optional: Set same debt for multiple selected lots

**Phase 2.3: Calculation Logic (35 min)**
- [ ] **Quota Calculation Service** - `quota-calculation-service.ts`
  ```typescript
  // Balance Formulas:
  // maintenanceBalance = configuredQuotas - registeredMaintenanceContributions
  // worksBalance = lot.initialWorksDebt + configuredWorksQuotas - registeredWorksContributions  
  // totalBalance = maintenanceBalance + worksBalance
  ```
- [ ] **Payment Application Service** - Auto-apply new contributions
- [ ] **Database Functions** - `quotas.ts` for quota CRUD and balance calculations  
- [ ] **Update Lot Functions** - Extend existing `lots.ts` with debt field handling
- [ ] **Integration** - Connect with existing contribution system

**Phase 2.4: User Interfaces (45 min)**
- [ ] **Quotas Dashboard** - `/quotas` main collection interface
  - Total debt summary (initial works + calculated maintenance)
  - Lot list with individual balances and status
  - Filters: All/Current/Overdue/Advance payments
  - Status indicators: Green (current), Yellow (overdue), Blue (advance)
- [ ] **Admin Quota Config** - `/admin/quotas` configuration panel
  - Set monthly maintenance quotas by year
  - Create special works quotas with dates
  - View historical quota configurations
- [ ] **Lot Detail Integration** - Expand existing lot page
  - Maintenance balance section (quotas vs registered contributions)
  - Works balance section (initial debt + new quotas vs payments)
  - Consolidated balance and status
  - Payment application history

**Phase 2.5: Dashboard Integration (20 min)**
- [ ] **Main Dashboard Cards** - Add quota metrics to home page
- [ ] **Collection Metrics** - Monthly collection vs targets
- [ ] **Overdue Alerts** - Highlight lots with highest debt
- [ ] **Real-time Updates** - Auto-refresh balances on new contributions

#### 🔧 **Technical Specifications**

**Data Integration Strategy:**
1. **Preserve Existing Data**: All 2024 maintenance contributions remain unchanged
2. **Calculate Automatically**: Maintenance balance from configured quotas vs registered contributions
3. **Simple Initial Debt**: Add `initialWorksDebt` field to existing Lot model  
4. **Manual Configuration**: Edit debt values through admin interface
5. **Future Automation**: All 2025+ calculations fully automated

**Payment Application Logic:**
```typescript
// Order of application for new contributions:
// 1. lot.initialWorksDebt (2024 works debt)
// 2. Overdue maintenance quotas (oldest first)  
// 3. Current period quotas
// 4. Advance payments (credit balance)
```

**File Structure:**
```
src/
├── app/
│   ├── quotas/page.tsx                    // Main collection dashboard
│   └── admin/
│       ├── quotas/page.tsx                // Quota configuration
│       └── initial-debt/page.tsx          // Manual debt configuration
├── lib/
│   ├── services/quota-calculation-service.ts  // Balance calculations
│   ├── database/quotas.ts                     // Database operations
│   └── actions/quota-actions.ts               // Server actions for quotas
└── components/quotas/
    ├── QuotasDashboard.tsx               // Main collection interface
    ├── LotQuotaDetail.tsx               // Individual lot status
    ├── QuotaConfigForm.tsx              // Admin configuration
    └── InitialDebtConfig.tsx            // Simple debt configuration per lot
```

**Translation Keys Required:**
- Quota-related labels (cuotas, saldo, balance, etc.)
- Status terms (al día, atrasado, adelantado)
- Manual configuration terms for initial debt
- Dashboard metrics labels

#### ✅ **Completion Criteria**

- [ ] **Manual Debt Config** - Can set initial works debt per lot manually
- [ ] **Balance Calculations** - Accurate maintenance and works balance calculations
- [ ] **Dashboard Functional** - Complete overview of lot payment statuses
- [ ] **Admin Configuration** - Can set quotas for future periods
- [ ] **Payment Integration** - New contributions automatically update balances
- [ ] **Production Ready** - All features tested and deployed

#### 📊 **Success Metrics**

- **Data Accuracy**: Balances match manual calculations
- **User Experience**: Intuitive navigation and clear status indicators  
- **Automation**: New contributions require no manual intervention
- **Reporting**: Complete visibility into collection status
- **Scalability**: Easy to add quotas for future years

**Estimated Total Implementation Time: 2 hours** _(Simplified with direct field in Lot model)_

---

### ✅ Phase 3: Integrations & Advanced Features

- ✅ **Google Drive integration** - Automatic receipt storage and organization _(2025-01-25)_
- ✅ **Admin panel** - Complete data import/export system _(2025-01-25)_
- ✅ **Mobile responsive design** - Optimized experience across devices _(2025-01-25)_
- [ ] **Loading states & UX** - useTransition for better user feedback
- [ ] **Audit trail system** - Complete transaction history tracking
- [ ] **Payment plans** - Structured debt recovery tools

---

## ⚡ **Quick Wins & Polish**

- ✅ **Mobile responsive design** - Optimized for all devices _(2025-01-25)_
- [ ] **Visual consistency improvements** - Standardize colors, spacing, and typography
- [ ] **Loading states with useTransition** - Modern React patterns for better UX
- [ ] **Error boundary improvements** - Better error handling and user messaging

---

## ✅ **Recently Completed (Major Features)**

- ✅ **Complete cash management system** - Full CRUD for contributions, expenses, lots
- ✅ **Production deployment** - Live at https://jalisco-travesias.vercel.app/
- ✅ **Google Drive integration** - Automatic receipt storage with organized folder structure
- ✅ **Admin panel** - CSV import/export, system management
- ✅ **Authentication system** - Google OAuth with admin role management
- ✅ **Responsive design** - Mobile-first approach with excellent UX
- ✅ **Real-time balance tracking** - Dynamic calculations across all fund types

---

## 💡 **Strategic Notes**

**Current System Status:**

- ✅ **Production Ready**: Full cash management system deployed and working
- ✅ **Core Features Complete**: CRUD operations, authentication, file storage
- 🎯 **Next Focus**: Quota & debt management for automated lot billing
- 📊 **Current Capability**: Manual contribution tracking with dynamic balance calculation
- 🔄 **Evolution Goal**: Automated monthly/annual quota system with debt tracking

**Implementation Order Logic:**

1. **Database foundation** - Must have data structure first
2. **Basic tracking** - Get core functionality working
3. **Advanced features** - Polish and integrations

---

_Next update: After each completed task_
