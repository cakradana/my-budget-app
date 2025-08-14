# Budget Tracker

[![CI](https://github.com/rcakradana/my-budget-app/actions/workflows/ci.yml/badge.svg)](https://github.com/rcakradana/my-budget-app/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/rcakradana/my-budget-app/branch/main/graph/badge.svg)](https://codecov.io/gh/rcakradana/my-budget-app)
[![Test Coverage](https://img.shields.io/badge/coverage-70%25-yellow)](./coverage/index.html)

A fullstack budget tracking application built with Next.js 15, Tailwind CSS, and PostgreSQL.

## Features

- 📊 **Dashboard** - Overview of balance, income, and expenses
- 💰 **Transaction Management** - Add, edit, and delete income/expense records
- 📈 **Budget Planning** - Set and track monthly/weekly budgets
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🔐 **Authentication** - Secure login with email/password and Google OAuth
- 📊 **Reports** - Visual charts and data export

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v3, ShadCN UI
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library + Coverage (v8)
- **CI/CD**: GitHub Actions + Codecov

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd my-budget-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Start PostgreSQL with Docker:

```bash
# Start PostgreSQL database
docker compose up -d postgres

# Optional: Start with pgAdmin for database management
docker compose --profile pgadmin up -d
```

5. Set up the database:

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

### Tables

- **users** - User accounts with authentication
- **categories** - Income/expense categories (weekly, monthly, other)
- **transactions** - Financial transactions with amounts and dates
- **budgets** - Budget allocations per category and period

### Sample Data

The seed script creates:

- Demo user (demo@example.com / demo123)
- Default categories (Makan, Transportasi, Kost/Sewa, etc.)
- Sample transactions for current month
- Budget allocations

## API Endpoints

### Authentication

- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Transactions

- `GET /api/transactions` - List transactions with pagination
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Categories

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Budgets

- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create/update budget

## Scripts

### 🚀 Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (with type checking)
- `npm run start` - Start production server
- `npm run clean` - Clean build artifacts

### ✨ Code Quality

- `npm run lint` - Check linting issues
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - TypeScript type checking
- `npm run check` - Run all checks in parallel (lint, format, type-check)
- `npm run check:fix` - Fix all auto-fixable issues
- `npm run validate` - Full validation (lint, format, type-check, tests)

### 📊 Performance & Security

- `npm run analyze` - Analyze bundle size
- `npm run analyze:server` - Analyze server bundle
- `npm run analyze:browser` - Analyze browser bundle
- `npm run audit` - Security audit (moderate level)
- `npm run audit:fix` - Auto-fix security issues
- `npm run deps:check` - Check for dependency updates
- `npm run deps:update` - Update all dependencies

### 🚀 CI/CD

- `npm run ci` - Run CI pipeline locally (validate + build)
- `npm run preflight` - Pre-deployment checks

### 🗄️ Database

- `npm run db:generate` - Generate migrations from schema
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (visual database editor)
- `npm run db:seed` - Seed database with sample data
- `npm run db:clear` - Clear all data from database
- `npm run db:reset` - Clear and reseed database

### 🧪 Testing

- `npm run test` - Run tests in watch mode (Vitest)
- `npm run test:run` - Run tests once
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run test:coverage` - Generate coverage report (70% threshold)

## Development Workflow

### Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:push
npm run db:seed

# Start development
npm run dev
```

### Daily Development

```bash
# Morning - Start your environment
npm run dev          # Start dev server (http://localhost:3000)
npm run db:studio    # Open database UI (optional)

# While coding - Check your work
npm run check        # Run all quality checks
npm run test         # Run tests in watch mode

# Before committing - Validate everything
npm run validate     # Full validation suite
# Note: Pre-commit hooks automatically lint and format your code
```

### Common Tasks

```bash
# Fresh database start
npm run db:reset

# Fix all code issues
npm run check:fix

# Build for production
npm run build
```

## Docker Commands

- `docker compose up -d postgres` - Start PostgreSQL database
- `docker compose --profile pgadmin up -d` - Start with pgAdmin
- `docker compose down` - Stop all services
- `docker compose logs postgres` - View database logs
- `docker compose exec postgres psql -U postgres -d budget_tracker` - Connect to database

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/budget_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id" # Optional
GOOGLE_CLIENT_SECRET="your-google-client-secret" # Optional
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main app pages
│   └── layout.tsx         # Root layout
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   └── ...           # Feature components
│   ├── lib/
│   │   ├── db/           # Database config and schema
│   │   ├── auth/         # Authentication config
│   │   └── utils/        # Utility functions
│   └── types/            # TypeScript type definitions
├── drizzle/              # Database migrations
└── public/               # Static assets
```

## Testing

The project uses Vitest for unit and integration testing with React Testing Library for component testing.

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Generate coverage report
npm run test:coverage

# Open interactive UI
npm run test:ui
```

### Coverage Requirements

The project maintains a minimum of 70% code coverage:

- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

Coverage reports are automatically generated and uploaded to Codecov during CI.

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

### Workflow Jobs

1. **Lint and Type Check** - Code quality checks
2. **Test** - Unit tests with PostgreSQL service
3. **Build** - Production build verification
4. **Security** - Dependency vulnerability scanning

### Pre-commit Hooks

Husky is configured to run checks before commits:

- Linting
- Formatting
- Type checking

To bypass hooks in emergency: `git commit --no-verify`

## Performance Optimization

### Bundle Analysis

```bash
# Analyze overall bundle
npm run analyze

# Analyze server bundle only
npm run analyze:server

# Analyze client bundle only
npm run analyze:browser
```

### Next.js Optimizations

- Turbopack for faster development builds
- Image optimization with next/image
- Font optimization with next/font
- Automatic code splitting
- API route caching
- Static generation where possible

## Security

### Regular Audits

```bash
# Check for vulnerabilities
npm run audit

# Auto-fix vulnerabilities
npm run audit:fix

# Check for outdated dependencies
npm run deps:check
```

### Best Practices

- Environment variables for secrets
- NEXTAUTH_SECRET for session encryption
- SQL injection prevention with Drizzle ORM
- XSS protection with React
- CSRF protection with NextAuth
- Rate limiting on API routes (TODO)

## Error Handling

The application implements comprehensive error handling:

- Custom error classes in `src/lib/errors.ts`
- Standardized API responses in `src/lib/api-response.ts`
- Global error boundaries
- Detailed logging in development
- User-friendly messages in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new features (maintain 70% coverage)
5. Run validation (`npm run validate`)
6. Commit your changes (hooks will auto-format)
7. Push to your branch
8. Submit a pull request

## License

This project is licensed under the MIT License.
