# Plotify - Technical Documentation

## 🛠️ Tech Stack

### Frontend

- **React 19.1.0** with hooks and modern patterns
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling with custom animations
- **Shadcn/ui** component library with Radix UI primitives
- **Lucide React** for iconography
- **Zod 4** for runtime validation
- **Responsive Design** for all devices

### Backend

- **Next.js 15.3.5** with App Router
- **PostgreSQL** database
- **Prisma ORM 6.12.0** for data management with Accelerate extension
- **Custom Authentication** system with session-based auth
- **Server Actions** for data mutations
- **Middleware** for route protection

### Development Tools

- **ESLint** with Next.js config
- **Prettier** with Tailwind CSS plugin
- **Commitizen** for conventional commits
- **tsx** for TypeScript execution
- **Prisma Studio** for database management

## 🏗️ Project Structure

```
/src
  /app                 # Next.js App Router pages
    /api               # API routes (auth endpoints)
    /expenses          # Expenses management page
    /income            # Income/contributions page
    /login             # Authentication page
    /lots              # Lots management page
  /components          # React components
    /layout            # Layout components
    /modals            # Modal components
    /shared            # Shared/reusable components
  /lib                 # Utility functions and services
    /actions           # Server actions
    /database          # Database queries
  /types               # TypeScript type definitions
/prisma
  /schema.prisma       # Database schema
  /migrations          # Prisma migration files
  /seed.ts             # Seed data script
/public                # Static assets
```

## 🔧 Environment Variables

```env
# Database
PRISMA_DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Authentication
ADMIN_PASSWORD="your-secure-admin-password"
```

## 📊 Data Model

### Main Entities

#### Lots (Lotes)

- `id`: Unique identifier
- `lotNumber`: Display number/identifier
- `owner`: Owner name
- `createdAt/updatedAt`: Timestamps

#### Contributions (Aportes)

- `id`: Unique identifier
- `lotId`: Reference to lot
- `type`: "maintenance" | "works"
- `amount`: Contribution amount
- `date`: Contribution date
- `description`: Optional description
- `createdAt/updatedAt`: Timestamps

#### Expenses (Gastos)

- `id`: Unique identifier
- `type`: "maintenance" | "works"
- `amount`: Expense amount
- `date`: Expense date
- `description`: Expense description
- `createdAt/updatedAt`: Timestamps

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
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
# Edit .env.local with your database URL and admin password

# Setup database
npm run db:generate
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Build and deploy: `npm run build && npm start`

## 🔒 Authentication System

### Implementation

- **Custom authentication** using session-based approach
- **Password-based login** for admin access
- **Middleware protection** for all routes except login
- **Server-side session management**

### Security Features

- Password hashing and validation
- Session-based authentication
- Protected routes via middleware
- Secure logout functionality

### Components

- `AuthButton`: Login/logout interface
- `login-form`: Authentication form
- `middleware.ts`: Route protection
- `lib/auth.ts`: Authentication utilities

## 🎨 UI Components Architecture

### Unified Components

- **ItemCard**: Unified card design for contributions and expenses
  - Date-first layout with improved typography
  - Contextual icons (🔧 maintenance, 🏗️ works)
  - Responsive design with hover states

- **SummaryCard**: Enhanced summary display
  - Prominent amount display
  - Contextual icons and color schemes

- **FilterSection**: Unified filtering interface
  - Type filters (maintenance/works/all)
  - Lot-specific filtering for contributions
  - URL-based state management

- **SummarySection**: Unified summary container
  - Configurable gradient backgrounds
  - Responsive grid layout
  - Conditional rendering based on data

### Design System

- **Typography**: Balanced hierarchy (ItemCards: text-sm, SummaryCards: text-lg)
- **Colors**: Consistent color palette with contextual variants
- **Spacing**: Systematic spacing using Tailwind utilities
- **Icons**: Lucide React with custom emoji icons for context

## 💰 Currency & Localization

### Currency Formatting

- **Colombian Peso (COP)** as primary currency
- **Display format**: $ symbol instead of COP for cleaner UI
- **Number formatting**: Spanish (Colombia) locale with proper thousand separators

### Language Support

- **Spanish**: Primary language with comprehensive translations
- **Translation system**: Custom translations object in `lib/translations.ts`
- **Consistent terminology**: Standardized labels and messages across components

## 🗄️ Database Management

### Prisma Configuration

```typescript
// Example schema entities
model Lot {
  id          String   @id @default(cuid())
  lotNumber   String
  owner       String
  contributions Contribution[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Contribution {
  id          String   @id @default(cuid())
  lotId       String
  type        ContributionType
  amount      Int
  date        DateTime
  description String?
  lot         Lot      @relation(fields: [lotId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Available Scripts

```bash
npm run db:migrate    # Run database migrations
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed database with sample data
npm run db:studio     # Open Prisma Studio
```

## 🚀 Performance Optimizations

### Frontend

- **Server Components**: Default to server components for better performance
- **Client Components**: Only when necessary for interactivity
- **Modern React**: Using React 19 features like useTransition and useOptimistic
- **Optimized Images**: Next.js automatic image optimization

### Backend

- **Server Actions**: Direct server-side mutations without API overhead
- **Database Indexing**: Proper indexing on frequently queried fields
- **Prisma Optimizations**: Query optimization and relation loading

## 🧪 Development Workflow

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Next.js recommended configuration
- **Prettier**: Consistent code formatting with Tailwind plugin
- **Conventional Commits**: Standardized commit messages with Commitizen

### Git Workflow

- **Feature branches**: `feat/feature-name` for new development
- **Commit conventions**: Using conventional commits
- **Pull requests**: Required for code review
- **Automated checks**: Linting and type checking

### Database Migrations

- **Descriptive names**: Clear migration names with purpose
- **Review process**: Always review migrations before applying
- **Version control**: All migrations tracked in git
- **Example**: `20240101000000_create_contributions_table`

## 🔧 Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## 📈 Community Configuration

### Flexible Setup

- **Community Name**: Configurable in translations
- **Lot Numbering**: Flexible system supporting various formats
- **Fund Types**: Two main categories (Maintenance, Works)
- **Currency**: Colombian Peso with clean $ display

### Adaptability

- **Residential Communities**: Gated communities, subdivisions
- **Rural Developments**: Agricultural or countryside communities
- **Urban Complexes**: Apartment buildings, condominiums
- **Mixed Developments**: Commercial and residential combinations

## 🔒 Security Considerations

### Authentication Security

- **Session-based**: Secure server-side session management
- **Password Protection**: Admin access with secure password handling
- **Route Protection**: Middleware-based route guards
- **Logout Security**: Proper session cleanup

### Data Security

- **Environment Variables**: Sensitive data in environment files
- **Database Security**: Secure database connections
- **Input Validation**: Zod schema validation
- **Type Safety**: TypeScript for runtime safety

## 📦 Key Dependencies

### Production Dependencies

- `@prisma/client` - Database ORM client
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icon library
- `tailwind-merge` - Utility for merging Tailwind classes
- `zod` - Schema validation

### Development Dependencies

- `@tailwindcss/postcss` - Tailwind CSS v4 PostCSS plugin
- `prettier-plugin-tailwindcss` - Prettier plugin for Tailwind
- `commitizen` - Conventional commit tool
- `tsx` - TypeScript execution

---

**Last Updated**: July 2025
**Version**: 1.0.0
**Maintained by**: Development Team
