import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Navbar user={(session as any).user} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
