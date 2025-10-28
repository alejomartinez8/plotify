# Plotify - AI-Powered Community Management System

A comprehensive cash management system for residential plot communities, built as an exploration of cutting-edge AI development tools. This project focuses on solving real-world financial tracking challenges through advanced AI-assisted development.

## 🎯 Project Goals

This project serves as both a practical application and an exploration laboratory for AI-powered development:

1. **AI Development Tools Research**  
   As a senior developer, I'm actively experimenting with cutting-edge AI coding assistants to understand their capabilities, limitations, and impact on development workflows:
   - **Cline**: AI software engineer assistant for autonomous coding
   - **Claude Code**: Anthropic's official CLI for development assistance
   - **AI-Driven Development**: Exploring how AI can accelerate development, improve code quality, and handle complex refactoring

2. **Production-Grade Implementation**  
   While serving as an AI tools testbed, this application maintains enterprise-level standards with real functionality for community management. Every feature is built to production quality, demonstrating how AI assistance can create valuable, maintainable software.

3. **Learning & Documentation**  
   Documenting the experience of building with AI tools, comparing different approaches, and sharing insights about the future of AI-assisted development.

## 🚀 Key Features

### 🏦 Cash Management System

- **Multi-Fund Architecture**: Separate tracking for maintenance, works, and activities funds
- **Real-time Balances**: Live view of available funds by type and total cash position
- **Payment Allocation**: Intelligent distribution of payments across fund types
- **Debt Tracking**: Complete owner debt management with partial payment support
- **Receipt Management**: Multi-type receipt system with Google Drive integration
- **Cash Flow Reports**: Historical and projected financial analysis

### 💰 Financial Operations

- **Income Classification**: Maintenance (monthly), Works (projects), Activities (events)
- **Initial Balance Setup**: Configure starting balances for each fund type
- **Payment Status Dashboard**: Visual indicators for paid/pending lots
- **Expense Tracking**: Detailed expenditure control by category and fund
- **Audit Trail**: Complete transaction history for compliance

## 🛠️ Tech Stack

### Core Technologies

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel
- **Authentication**: NextAuth.js or Clerk

### AI Development Tools

- **Claude Code**: Anthropic's CLI for AI-assisted development
- **Cline**: VSCode extension for autonomous AI coding
- **Claude Sonnet 4**: Latest AI model for advanced code generation and refactoring
- **AI Workflow**: Prompt engineering, iterative development, and AI-human collaboration patterns

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/alejomartinez8/plotify.git
cd plotify

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Setup database
npm run bd:generate
npm run bd:migrate
npm run bd:seed

# Start development server
npm run dev
```

For detailed technical documentation, see [TECHNICAL.md](./TECHNICAL.md).

## 📱 Usage

### System Access

- **Users**: Community administrators, treasurers
- **Roles**: Admin, Treasurer, Read-only

### Workflow

1. **Setup Initial Balances**: Configure starting cash balances for each fund type
2. **Record Income**: Track payments by type (maintenance/works/activities) and lot
3. **Manage Expenses**: Document outflows with proper fund allocation
4. **Monitor Cash Flow**: Real-time dashboard showing available funds by type
5. **Track Debt**: Manage outstanding payments and partial payment plans
6. **Generate Reports**: Comprehensive financial reports and audit trails

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

## 🤖 AI Development Insights

This project serves as a real-world case study for AI-assisted development. Key learnings include:

### Tools Comparison

- **Cline**: Excellent for autonomous feature development and complex refactoring tasks
- **Claude Code**: Superior for interactive development, code review, and iterative improvements
- **Combined Approach**: Using multiple AI tools in different phases yields optimal results

### AI Development Benefits

- ⚡ **Speed**: Rapid prototyping and feature implementation
- 🔍 **Code Quality**: AI-assisted refactoring and best practices application
- 📚 **Learning**: Discovering new patterns and modern development techniques
- 🔄 **Iteration**: Quick pivots and architectural changes

### Challenges & Limitations

- Context management for large codebases
- Balancing AI suggestions with domain expertise
- Maintaining code consistency across AI-generated sections

## 📈 Project Status

- **Version**: 1.0.0
- **Status**: Active development with AI tools exploration
- **Last Update**: July 2025
- **Location**: Medellín, Colombia
- **AI Tools Used**: Cline, Claude Code, Claude Sonnet 4

For development roadmap and current tasks, see [TODO.md](./TODO.md).

## 👥 Team

**Lead Developer**

- Alejandro Martínez - Tech Lead & Full-Stack Developer
- GitHub: [@alejomartinez8](https://github.com/alejomartinez8)
- LinkedIn: [alejomartinez](https://linkedin.com/in/alejomartinez)

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for more details.

## 🙏 Acknowledgments

- Residential community administrators and beta testers
- **Anthropic** for Claude Code and Claude Sonnet 4 model
- **Cline** development team for the autonomous coding assistant
- Open source community contributors
- Early AI development pioneers sharing insights and best practices

---

_Exploring the future of AI-powered software development_
