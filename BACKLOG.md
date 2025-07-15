# Plotify - Development Backlog

## 🚀 Current Sprint - Internationalization & Database Migration

### ✅ Completed

- [x] Initial Next.js 15 project structure
- [x] TypeScript and Tailwind CSS 4 configuration
- [x] Basic components and types definition
- [x] Mock data implementation

### 🔄 In Progress

- [ ] **Internationalization (i18n) Setup**
  - [ ] Install next-intl dependencies
  - [ ] Configure i18n middleware
  - [ ] Create translation files (en/es)
  - [ ] Update components to use translations

### 📋 To Do - High Priority

#### 1. Internationalization (i18n)

- [ ] **Next-intl Configuration**
  - [ ] Install and configure next-intl
  - [ ] Setup middleware for locale detection
  - [ ] Create locale switcher component
- [ ] **Translation Files**
  - [ ] Create en.json (English - default)
  - [ ] Create es.json (Spanish)
  - [ ] Translate all UI text
- [ ] **Component Updates**
  - [ ] Update all components to use useTranslations
  - [ ] Format numbers and dates by locale
  - [ ] Update navigation and forms

#### 2. Database Setup (Supabase)

- [ ] **Supabase Configuration**
  - [ ] Install Supabase dependencies
  - [ ] Initial client configuration
  - [ ] Environment variables setup
- [ ] **SQL Migrations**
  - [ ] 001_create_lots_table.sql
  - [ ] 002_create_contributions_table.sql
  - [ ] 003_create_expenses_table.sql
  - [ ] 004_create_indexes.sql
- [ ] **Seed Data**
  - [ ] Migrate mock data to seed files
  - [ ] Initial population script
- [ ] **Supabase Client**
  - [ ] Configure client for Server Components
  - [ ] Configure client for Client Components
  - [ ] Implement real data functions

#### 3. Core Functionality

- [ ] **Authentication**
  - [ ] Setup Supabase Auth
  - [ ] Login/register pages
  - [ ] Route protection middleware
- [ ] **Complete CRUD Operations**
  - [ ] Create contributions
  - [ ] Edit contributions
  - [ ] Delete contributions
  - [ ] Create expenses
  - [ ] Edit expenses
  - [ ] Delete expenses

### 📋 Backlog - Medium Priority

#### 4. UX/UI Improvements

- [ ] **Form Validation**
  - [ ] Integrate Zod for validation
  - [ ] Improved error messages
  - [ ] Loading states
- [ ] **Filters and Search**
  - [ ] Filter by month/year
  - [ ] Filter by type (maintenance/works)
  - [ ] Search by owner
- [ ] **Enhanced Dashboard**
  - [ ] Charts with Chart.js or Recharts
  - [ ] Advanced metrics
  - [ ] Report exports

#### 5. Advanced Features

- [ ] **Notification System**
  - [ ] Email notifications
  - [ ] WhatsApp integration (optional)
  - [ ] Payment reminders
- [ ] **Delinquency Management**
  - [ ] Payment status tracking
  - [ ] Delinquency reports
  - [ ] Overdue payment tracking
- [ ] **Roles and Permissions**
  - [ ] Admin vs Owner roles
  - [ ] Granular permissions
  - [ ] Audit logs

### 📋 Backlog - Low Priority

#### 6. Technical Optimizations

- [ ] **Performance**
  - [ ] React Query/SWR for caching
  - [ ] Optimistic updates
  - [ ] Suspense boundaries
- [ ] **SEO and Accessibility**
  - [ ] Dynamic meta tags
  - [ ] a11y improvements
  - [ ] Lighthouse optimizations
- [ ] **Testing**
  - [ ] Unit tests with Jest
  - [ ] Integration tests
  - [ ] E2E tests with Playwright

#### 7. DevOps and Deployment

- [ ] **CI/CD**
  - [ ] GitHub Actions
  - [ ] Automated testing
  - [ ] Automated deployment
- [ ] **Monitoring**
  - [ ] Error tracking (Sentry)
  - [ ] Analytics
  - [ ] Performance monitoring

---

## 📝 Development Notes

### Technical Decisions

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel
- **Authentication**: Supabase Auth
- **Internationalization**: next-intl
- **Languages**: English (default), Spanish

### Data Structure

- **Lots**: ~35 lots with owners
- **Contributions**: Separated into maintenance and works
- **Expenses**: Categorized by type and category

### Immediate Next Steps

1. Setup internationalization (i18n)
2. Configure Supabase
3. Create SQL migrations
4. Migrate mock data to real database
5. Implement data functions with Supabase client
