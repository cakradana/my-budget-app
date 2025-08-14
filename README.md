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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with sample data
- `npm test` - Run tests

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
