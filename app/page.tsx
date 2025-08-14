import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth/next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth/config";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold">💰 Budget Tracker</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Take control of your finances with our easy-to-use budget tracking
            application. Monitor income, expenses, and reach your savings goals.
          </p>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>💰 Track Balance</CardTitle>
              <CardDescription>Monitor your financial health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep track of your income and expenses to maintain a healthy
                balance and achieve your financial goals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📈 Manage Budgets</CardTitle>
              <CardDescription>Set and track spending limits</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create monthly and weekly budgets for different categories to
                control your spending effectively.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>� View Reports</CardTitle>
              <CardDescription>Analyze your spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get insights into your financial habits with detailed reports
                and interactive charts.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 text-center">
          <div className="space-x-4">
            <Link href="/auth/signin">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg">
                Create Account
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2 font-medium">Try the demo account:</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo123</p>
          </div>
        </div>
      </div>
    </main>
  );
}
