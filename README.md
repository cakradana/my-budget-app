# Budget Tracker

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

### 🗄️ Database

- `npm run db:generate` - Generate migrations from schema
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (visual database editor)
- `npm run db:seed` - Seed database with sample data
- `npm run db:clear` - Clear all data from database
- `npm run db:reset` - Clear and reseed database

### 🧪 Testing

- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Generate coverage report

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.
