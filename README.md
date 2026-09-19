# Plotify - Community Cash Management System

A cash management system for residential plot communities, built to track contributions, expenses, and debt across multiple fund types with full transparency and accountability.

**Live**: [jalisco-travesias.vercel.app](https://jalisco-travesias.vercel.app/)

## 🚀 Key Features

### 🏦 Cash Management

- **Multi-Fund Categories**: Maintenance, Works, and Others, applied consistently to both income and expenses
- **Real-time Balances**: Dashboard with income, expenses, and balance per fund category
- **Quota & Debt Tracking**: Configurable maintenance/works quotas with automatic debt calculation per lot
- **Receipt Storage**: Receipts and supporting files stored via Google Drive integration
- **CSV Import/Export**: Bulk operations for contributions and expenses

### ✅ Approval Workflow

- **Treasurer Role**: Validates every income/expense entry, similar to reconciling a bank statement
- **Two-State Records**: Entries move between `pending` and `approved`
- **Field Locking**: Once approved, amount/type/date become immutable (deletion requires un-approving first)
- **Audit Trail**: Every approve/un-approve action is logged with who, when, and an optional note

### 🔐 Roles & Access Control

- **Admin**: Full CRUD on lots, contributions, and expenses; manages users and quotas
- **Treasurer**: Approves/un-approves records; read-only otherwise
- **Owner**: Read-only access to all financial data, derived from the lot's registered email
- **Authentication**: Google OAuth via NextAuth v5

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS 4, Shadcn/ui, Recharts
- **Backend**: Next.js Server Actions, Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5 (Google OAuth)
- **Storage**: Google Drive API for receipts
- **Testing**: Vitest + Testing Library
- **Deployment**: Vercel

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/alejomartinez8/plotify.git
cd plotify

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

For detailed technical documentation, see [TECHNICAL.md](./TECHNICAL.md).

## 📱 Usage

1. **Setup Quotas**: Configure maintenance and works quotas per period
2. **Record Contributions**: Track payments by fund type and lot
3. **Record Expenses**: Document outflows with proper fund allocation
4. **Approve Records**: Treasurer reviews and approves pending entries
5. **Monitor Balances**: Dashboard shows real-time balance and debt per fund
6. **Import/Export**: Use CSV tools for bulk data operations

## 🏘️ Community Configuration

The system is flexible and can be configured for various types of communities:

- **Residential Plots**: Gated communities, subdivisions
- **Rural Communities**: Agricultural or countryside developments
- **Urban Complexes**: Apartment complexes, condominiums
- **Mixed-Use**: Commercial and residential combinations

Configurable elements include community name, lot numbering, fund types, and currency (Colombian Peso by default).

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- All code, comments, and documentation must be in English
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Every new feature, fix, or refactor must come with tests (`npm test`)

## 🐛 Reporting Issues

If you find a bug or have a suggestion:

1. Check if a similar issue already exists
2. Create a new issue with:
   - Clear problem description
   - Steps to reproduce
   - Expected behavior
   - Screenshots if applicable

## 📈 Project Status

- **Status**: Active development, in production use
- **Location**: Medellín, Colombia

For development roadmap and current tasks, see [TODO.md](./TODO.md).

## 👥 Team

**Lead Developer**

- Alejandro Martínez - Tech Lead & Full-Stack Developer
- GitHub: [@alejomartinez8](https://github.com/alejomartinez8)
- LinkedIn: [alejomartinez](https://linkedin.com/in/alejomartinez)

## 📄 License

This project is licensed under the Apache License 2.0. See `LICENSE` for more details.

## 🙏 Acknowledgments

- Residential community administrators and beta testers
- **Anthropic** for Claude Code
- Open source community contributors
