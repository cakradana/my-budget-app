import { redirect } from "next/navigation";

import { and, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { getServerSession } from "next-auth/next";

import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { categories, transactions } from "@/lib/db/schema";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams: searchParamsPromise,
}: PageProps) {
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session as any)?.user?.id) {
    redirect("/auth/signin");
  }

  const searchParams = await searchParamsPromise;

  const currentPage = parseInt(searchParams.page || "1");
  const pageSize = 10;
  const offset = (currentPage - 1) * pageSize;

  // Build where conditions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereConditions = [eq(transactions.userId, (session as any).user.id)];

  if (searchParams.category) {
    whereConditions.push(eq(transactions.categoryId, searchParams.category));
  }

  if (searchParams.startDate) {
    whereConditions.push(gte(transactions.date, searchParams.startDate));
  }

  if (searchParams.endDate) {
    whereConditions.push(lte(transactions.date, searchParams.endDate));
  }

  // Fetch transactions with pagination
  const transactionData = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      date: transactions.date,
      note: transactions.note,
      createdAt: transactions.createdAt,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryType: categories.type,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]
    )
    .orderBy(desc(transactions.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Get total count for pagination
  const totalTransactions = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]
    );

  const totalPages = Math.ceil(totalTransactions[0].count / pageSize);

  // Fetch all categories for filters and forms
  const categoriesData = await db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
    })
    .from(categories)
    .where(
      or(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq(categories.userId, (session as any).user.id),
        isNull(categories.userId) // Global categories
      )
    )
    .orderBy(categories.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses
          </p>
        </div>
        <AddTransactionDialog categories={categoriesData}>
          <Button>Add Transaction</Button>
        </AddTransactionDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
          <CardDescription>
            Filter your transactions by category and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFilters
            categories={categoriesData}
            searchParams={searchParams}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {totalTransactions[0].count} total transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactionData}
            categories={categoriesData}
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={searchParams}
          />
        </CardContent>
      </Card>
    </div>
  );
}
