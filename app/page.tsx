import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">💰 Budget Tracker</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Take control of your finances with our easy-to-use budget tracking application. 
            Monitor income, expenses, and reach your savings goals.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>💰 Track Balance</CardTitle>
              <CardDescription>Monitor your financial health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep track of your income and expenses to maintain a healthy balance and achieve your financial goals.
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
                Create monthly and weekly budgets for different categories to control your spending effectively.
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
                Get insights into your financial habits with detailed reports and interactive charts.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Link href="/auth/signin">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg">Create Account</Button>
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Try the demo account:</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo123</p>
          </div>
        </div>
      </div>
    </main>
  );
}
