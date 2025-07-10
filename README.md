# Plotify - Community Plot Management System

A comprehensive management system for residential plot communities, designed to efficiently handle maintenance fees, improvement contributions, and expense tracking with full transparency and accountability.

## 🎯 Project Goals

This project serves two primary objectives:

1. **IA Tool Exploration**  
   As a senior developer, I'm actively experimenting with next-generation AI development tools like:
   - Cline (AI software engineer assistant)
   - Claude Sonnet/Opus models
   - AI-powered development workflows
   - Emerging code generation paradigms

2. **Real-World Implementation**  
   While serving as a testbed for AI tools, the application maintains:
   - Production-grade code quality
   - Full functional requirements
   - Real user value for personal financial management
   - Modern architecture patterns

## 🚀 Key Features

* **Separate Fund Management**: Independent handling of maintenance and improvement funds
* **Monthly Tracking**: Clear visualization of payment status by plot and month
* **Financial Dashboard**: Executive summary with balances and key metrics
* **Expense Recording**: Detailed control of expenditures by category
* **Intuitive Interface**: Responsive design optimized for desktop and mobile
* **Visual Reports**: Status indicators with color-coded system

## 📋 Functionality

### Main Dashboard

* Financial summary of both funds
* Monthly contribution and expense metrics
* General balance per fund
* Compliance statistics

### Contribution Management

* Plot-by-plot and month-by-month contribution recording
* Separation between maintenance and improvement funds
* Payment status tracking
* Historical contribution records

### Expense Control

* Detailed expense recording by fund
* Expenditure categorization
* Available balance tracking
* Transaction history

### Visualization

* Excel-like tracking tables
* Visual status indicators
* Year and month filters
* Color codes for easy identification

## 🛠️ Tech Stack

### Frontend

* **React 18** with hooks
* **TypeScript** for type safety
* **Tailwind CSS** for styling
* **Lucide React** for iconography
* **Responsive Design** for all devices

### Backend (Next iteration)

* **Next.js 15** with App Router
* **PostgreSQL** as database
* **Prisma ORM** for data management
* **NextAuth.js** for authentication

### Deployment

* **Vercel** for hosting
* **Supabase/PlanetScale** for database
* **GitHub Actions** for CI/CD

## 🏗️ Installation & Setup

### Current Version (Pure React)

```bash
# Current version works as a demo without backend
# Code is contained in a single React file
```

### Next.js Version (Next iteration)

```bash
# Clone the repository
git clone https://github.com/alejomartinez8/plotify.git
cd plotify

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/plotify"

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

* Plot ID
* Owner name
* Active/inactive status
* Contact information

#### Contributions

* Plot ID
* Fund type (maintenance/improvements)
* Amount
* Month and year
* Payment date
* Description/notes

#### Expenses

* Fund type
* Amount
* Date
* Description
* Category
* Receipt/reference

## 🎯 Development Roadmap

### Phase 1: MVP (Current)

* [x] Functional basic interface
* [x] Contribution management
* [x] Expense control
* [x] Dashboard with metrics
* [x] Tracking tables

### Phase 2: Backend & Persistence

* [ ] Migration to Next.js
* [ ] PostgreSQL implementation
* [ ] Complete REST API
* [ ] User authentication
* [ ] Roles and permissions

### Phase 3: Advanced Features

* [ ] PDF report generation
* [ ] Automatic notifications
* [ ] Excel export
* [ ] Advanced search and filters
* [ ] Change history

### Phase 4: Optimizations

* [ ] PWA for offline use
* [ ] Intelligent caching
* [ ] Performance optimization
* [ ] Analytics and metrics
* [ ] Automatic backup

## 🏘️ Community Configuration

### Configurable Elements

* **Community Name**: Customizable for any residential community
* **Plot Numbering**: Flexible system (numbers, letters, mixed)
* **Fund Types**: Configurable categories (maintenance, improvements, emergency)
* **Payment Periods**: Monthly, quarterly, or annual
* **Currency**: Multi-currency support

### Example Communities

* **Residential Plots**: Gated communities, subdivisions
* **Rural Communities**: Agricultural or countryside developments
* **Urban Complexes**: Apartment complexes, condominiums
* **Mixed-Use**: Commercial and residential combinations

## 🤝 Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

* Use TypeScript for new features
* Maintain test coverage
* Document significant changes
* Follow naming conventions

## 🐛 Reporting Issues

If you find a bug or have a suggestion:

1. Check if a similar issue already exists
2. Create a new issue with:

   * Clear problem description
   * Steps to reproduce
   * Expected behavior
   * Screenshots if applicable

## 📱 Usage

### System Access

* **URL**: \[In development]
* **Users**: Community administrators
* **Roles**: Admin, Treasurer, Read-only

### Workflow

1. **Record Contributions**: Mark payments received by plot and month
2. **Record Expenses**: Document money outflows by category
3. **Monitoring**: Review dashboard for general status
4. **Reports**: Generate monthly/annual reports

## 🔒 Security

* Mandatory authentication for access
* Audit logs for changes
* Automatic data backup
* Sensitive information encryption

## 📈 Metrics

### System Objectives

* Reduce administration time by 80%
* Improve financial transparency
* Facilitate delinquent tracking
* Automate report generation

### KPIs

* Percentage of on-time payments
* Balance per fund
* Expenses by category
* Monthly compliance

## 🌟 Project Name Suggestions

Based on functionality and versatility:

## 👥 Team

**Lead Developer**

* Alejandro Martínez - Tech Lead & Full-Stack Developer
* GitHub: [@alejomartinez8](https://github.com/alejomartinez8)
* LinkedIn: [alejomartinez](https://linkedin.com/in/alejomartinez)

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for more details.

## 🙏 Acknowledgments

* Residential community administrators
* Beta testers and early adopters
* Open source community contributors

---

**Version**: 1.0.0
**Last Update**: July 2025
**Status**: Active development
**Location**: Medellín, Colombia

---

*Developed with ❤️ for residential communities worldwide*
