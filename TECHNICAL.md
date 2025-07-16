# Plotify - Technical Documentation

## 🛠️ Tech Stack

### Frontend

- **React 19** with hooks
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Lucide React** for iconography
- **Responsive Design** for all devices

### Backend

- **Next.js 15** with App Router
- **Vercel Postgres** as database
- **Prisma ORM** for data management
- **NextAuth.js** or **Clerk** for authentication
- **next-intl** for internationalization

### Deployment

- **Vercel** for hosting
- **Vercel Postgres** for database
- **GitHub Actions** for CI/CD

## 🏗️ Project Structure

```
/src
  /app                 # Next.js App Router pages
  /components          # React components
  /lib                 # Utility functions
  /types               # TypeScript types
/prisma
  /schema.prisma       # Database schema
  /migrations          # Prisma migration files
  /seed.ts             # Seed data script
/public                # Static assets
/messages              # i18n translation files
```

## 🔧 Environment Variables

```env
# Database (Vercel Postgres)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NEXT_PUBLIC_APP_NAME="Plotify"
NEXT_PUBLIC_COMMUNITY_NAME="Your Community Name"
```

## 📊 Data Model

### Main Entities

#### Plots

- Plot ID
- Owner name
- Active/inactive status
- Contact information

#### Contributions

- Plot ID
- Fund type (maintenance/improvements)
- Amount
- Month and year
- Payment date
- Description/notes

#### Expenses

- Fund type
- Amount
- Date
- Description
- Category
- Receipt/reference

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+
- Vercel account
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/alejomartinez8/plotify.git
cd plotify

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Setup database
npx prisma generate
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

### Production Deployment

#### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Go to Storage tab in Vercel dashboard
3. Create new Postgres database
4. Environment variables are automatically configured
5. Deploy automatically on push to main branch

#### Database Setup (Vercel Postgres)

1. In Vercel dashboard, go to Storage tab
2. Click "Create Database" → "Postgres"
3. Choose database name and region
4. Environment variables are automatically added to your project
5. Run migrations: `npx prisma migrate deploy`

## 🏘️ Community Configuration

### Configurable Elements

- **Community Name**: Customizable for any residential community
- **Plot Numbering**: Flexible system (numbers, letters, mixed)
- **Fund Types**: Configurable categories (maintenance, improvements, emergency)
- **Payment Periods**: Monthly, quarterly, or annual
- **Currency**: Multi-currency support

### Example Communities

- **Residential Plots**: Gated communities, subdivisions
- **Rural Communities**: Agricultural or countryside developments
- **Urban Complexes**: Apartment complexes, condominiums
- **Mixed-Use**: Commercial and residential combinations

## 🔒 Security Considerations

### Authentication

- Mandatory authentication for access
- Role-based access control (Admin, Treasurer, Read-only)
- Session management with NextAuth.js/Clerk

### Data Protection

- Sensitive information encryption
- Audit logs for changes
- Automatic data backup with Vercel Postgres
- HTTPS enforcement

### Environment Security

- Environment variables for sensitive data
- No hardcoded secrets in code
- Secure database connections via Vercel
- Regular security updates

## 📈 Performance Optimization

### Frontend Optimizations

- React Query/SWR for caching
- Optimistic updates
- Suspense boundaries
- Code splitting and lazy loading

### Backend Optimizations

- Database indexing
- Query optimization with Prisma
- API response caching
- Image optimization

### Monitoring

- Error tracking (Sentry)
- Performance monitoring
- Analytics integration
- Database performance metrics via Vercel

## 🧪 Testing Strategy

### Unit Testing

- Jest for unit tests
- React Testing Library for component tests
- Prisma testing utilities for database tests

### Integration Testing

- API endpoint testing
- Database integration tests
- Authentication flow testing

### End-to-End Testing

- Playwright for E2E tests
- Critical user journey testing
- Cross-browser compatibility

## 🔄 Development Workflow

### Git Workflow

- Feature branches for new development
- Pull requests for code review
- Automated testing on PR
- Main branch auto-deploys to production

### Database Migrations

- Use descriptive names with timestamps
- Review migrations before execution
- Follow Prisma migration conventions
- Include proper rollback considerations
- Example: `20240101000000_create_users_table`

### Code Standards

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for git messages
- Component and function documentation

## 🌐 Internationalization (i18n)

### Setup

- next-intl for internationalization
- Locale detection middleware
- Translation file management

### Supported Languages

- English (default)
- Spanish
- Extensible for additional languages

### Implementation

- Translation keys in components
- Locale-specific formatting for dates/numbers
- Dynamic locale switching

## 📱 Progressive Web App (PWA)

### Features

- Offline functionality
- App-like experience
- Push notifications
- Background sync

### Implementation

- Service worker registration
- Manifest file configuration
- Offline data caching
- Background data synchronization

---

**Last Updated**: July 2025
**Maintained by**: Development Team
