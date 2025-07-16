# Plotify - Community Plot Management System

A comprehensive management system for residential plot communities, designed to efficiently handle maintenance fees, improvement contributions, and expense tracking with full transparency and accountability.

## 🎯 Project Goals

This project serves two primary objectives:

1. **AI Tool Exploration**  
   As a senior developer, I'm actively experimenting with next-generation AI development tools like Cline (AI software engineer assistant), Claude Sonnet/Opus models, and AI-powered development workflows.

2. **Real-World Implementation**  
   While serving as a testbed for AI tools, the application maintains production-grade code quality, full functional requirements, and real user value for community financial management.

## 🚀 Key Features

- **Separate Fund Management**: Independent handling of maintenance and improvement funds
- **Monthly Tracking**: Clear visualization of payment status by plot and month
- **Financial Dashboard**: Executive summary with balances and key metrics
- **Expense Recording**: Detailed control of expenditures by category
- **Intuitive Interface**: Responsive design optimized for desktop and mobile
- **Visual Reports**: Status indicators with color-coded system
- **Multi-language Support**: English and Spanish with extensible i18n system

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js 15 with App Router
- **Database**: Vercel Postgres with Prisma ORM
- **Deployment**: Vercel
- **Authentication**: NextAuth.js or Clerk

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
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

For detailed technical documentation, see [TECHNICAL.md](./TECHNICAL.md).

## 📱 Usage

### System Access

- **Users**: Community administrators, treasurers
- **Roles**: Admin, Treasurer, Read-only

### Workflow

1. **Record Contributions**: Mark payments received by plot and month
2. **Record Expenses**: Document money outflows by category
3. **Monitoring**: Review dashboard for general status
4. **Reports**: Generate monthly/annual reports

## 🏘️ Community Configuration

The system is flexible and can be configured for various types of communities:

- **Residential Plots**: Gated communities, subdivisions
- **Rural Communities**: Agricultural or countryside developments
- **Urban Complexes**: Apartment complexes, condominiums
- **Mixed-Use**: Commercial and residential combinations

Configurable elements include community name, plot numbering systems, fund types, payment periods, and currency support.

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
- Maintain test coverage for new features

## 🐛 Reporting Issues

If you find a bug or have a suggestion:

1. Check if a similar issue already exists
2. Create a new issue with:
   - Clear problem description
   - Steps to reproduce
   - Expected behavior
   - Screenshots if applicable

## 📈 Project Status

- **Version**: 1.0.0
- **Status**: Active development
- **Last Update**: July 2025
- **Location**: Medellín, Colombia

For development roadmap and task tracking, see [BACKLOG.md](./BACKLOG.md).

## 👥 Team

**Lead Developer**

- Alejandro Martínez - Tech Lead & Full-Stack Developer
- GitHub: [@alejomartinez8](https://github.com/alejomartinez8)
- LinkedIn: [alejomartinez](https://linkedin.com/in/alejomartinez)

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for more details.

## 🙏 Acknowledgments

- Residential community administrators
- Beta testers and early adopters
- Open source community contributors

---

_Developed with ❤️ for residential communities worldwide_
