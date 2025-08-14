import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { transactions, categories, budgets } from "@/lib/db/schema";
import { gte, lte, eq, and, sql } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, getCurrentMonthRange } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session as any)?.user?.id) {
    return <div>Loading...</div>;
  }

  const { start, end } = getCurrentMonthRange();

  // Get monthly summary
  const monthlyTransactions = await db
    .select({
      amount: transactions.amount,
    })
    .from(transactions)
    .where(
      and(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq(transactions.userId, (session as any).user.id),
        gte(transactions.date, start),
        lte(transactions.date, end)
      )
    );

  const totalIncome = monthlyTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    monthlyTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const balance = totalIncome - totalExpenses;

  // Get recent transactions
  const recentTransactions = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      date: transactions.date,
      note: transactions.note,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq(transactions.userId, (session as any).user.id))
    .orderBy(sql`${transactions.createdAt} DESC`)
    .limit(5);

  // Get budget summary
  const budgetSummary = await db
    .select({
      categoryName: categories.name,
      budgetAmount: budgets.amount,
      spent: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END), 0)`,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .leftJoin(
      transactions,
      and(
        eq(transactions.categoryId, budgets.categoryId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq(transactions.userId, (session as any).user.id),
        gte(transactions.date, start),
        lte(transactions.date, end)
      )
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq(budgets.userId, (session as any).user.id))
    .groupBy(budgets.id, categories.name, budgets.amount)
    .limit(4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          Welcome back, {(session as any).user.name}! Here&apos;s your financial
          overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? "Positive balance" : "Negative balance"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Income
            </CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">Income this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <span className="text-2xl">📉</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Spent this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalIncome > 0
                ? Math.round(
                    ((totalIncome - totalExpenses) / totalIncome) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Of income saved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No transactions yet. Start by adding your first transaction!
                </p>
              ) : (
                recentTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{transaction.categoryName}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.note || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div
                      className={`font-bold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              Your spending vs budget this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetSummary.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No budgets set. Create your first budget to track spending!
                </p>
              ) : (
                budgetSummary.map((budget, index) => {
                  const spent = Number(budget.spent) || 0;
                  const budgetAmount = budget.budgetAmount || 0;
                  const percentage =
                    budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                  const isOverBudget = percentage > 100;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {budget.categoryName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(spent)} /{" "}
                          {formatCurrency(budgetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isOverBudget ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% used
                        {isOverBudget && (
                          <span className="text-red-500 ml-2">
                            Over budget!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
