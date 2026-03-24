import { Card, CardContent } from "@atl/ui/components/card";
import { Skeleton } from "@atl/ui/components/skeleton";
import { ArrowRight, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  fetchQuickBooksFinancialSummary,
  fetchQuickBooksTransactions,
  getCloudflareEnv,
} from "@/lib/integrations/quickbooks";
import { formatCurrency } from "@/lib/utils";

import { getPageMetadata } from "../metadata";
import { MetricsSection } from "./metrics-section";
import { TransactionsList } from "./transactions-list";
import { UpdatesSection } from "./updates-section";

export const metadata: Metadata = getPageMetadata("open");

// Explicitly set Node.js runtime for Buffer usage in dependencies
export const runtime = "nodejs";

// Mark as dynamic since we fetch from API
export const dynamic = "force-dynamic";
export const revalidate = 0;

function HeroSection() {
  return (
    <div className="mb-16 space-y-6 text-center">
      <h1 className="font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
        A transparent organization since 2023
      </h1>
      <p className="mx-auto max-w-3xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
        As a 501(c)(3) non-profit, we practice radical transparency. Our
        finances, community growth, and project metrics are open for everyone to
        see.
      </p>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Mobile card layout skeleton */}
      <div className="grid gap-4 sm:hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <Card key={`mobile-skeleton-${index}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden rounded-lg border sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  Description
                </th>
                <th className="px-4 py-3 text-right font-medium text-sm">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, index) => (
                <tr
                  className="border-b last:border-0"
                  key={`desktop-skeleton-${index}`}
                >
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface TransactionStats {
  expenses: number;
  income: number;
  netIncome: number;
  total: number;
}

function SummaryStats({ stats }: { stats: TransactionStats }) {
  const netIsPositive = stats.netIncome >= 0;

  return (
    <div className="grid grid-cols-1 gap-6 px-6 pt-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="font-medium text-muted-foreground text-sm">
              Total Transactions
            </div>
            <div className="rounded-lg bg-primary/10 p-2">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="font-bold text-3xl tracking-tight">
            {stats.total.toLocaleString()}
          </div>
          <div className="mt-2 text-muted-foreground text-xs">Recorded</div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-2 border-green-500/20 bg-green-500/5 transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="font-medium text-muted-foreground text-sm">
              Gross Income
            </div>
            <div className="rounded-lg bg-green-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <div className="font-bold text-3xl text-green-600 tracking-tight dark:text-green-500">
            {formatCurrency(stats.income)}
          </div>
          <div className="mt-2 text-muted-foreground text-xs">
            Donated by Supporters
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-2 border-red-500/20 bg-red-500/5 transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="font-medium text-muted-foreground text-sm">
              Total Expenses
            </div>
            <div className="rounded-lg bg-red-500/20 p-2">
              <TrendingDown className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <div className="font-bold text-3xl text-red-500 tracking-tight dark:text-red-400">
            {formatCurrency(stats.expenses)}
          </div>
          <div className="mt-2 text-muted-foreground text-xs">
            Spent on our Mission
          </div>
        </CardContent>
      </Card>

      <Card
        className={`relative overflow-hidden border-2 ${netIsPositive ? "border-blue-500/20 bg-blue-500/5" : "border-orange-500/20 bg-orange-500/5"} transition-shadow hover:shadow-lg`}
      >
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="font-medium text-muted-foreground text-sm">
              Net Income
            </div>
            <div
              className={`rounded-lg p-2 ${netIsPositive ? "bg-blue-500/20" : "bg-orange-500/20"}`}
            >
              <TrendingUp
                className={`h-5 w-5 ${netIsPositive ? "text-blue-600 dark:text-blue-500" : "text-orange-600 dark:text-orange-500"}`}
              />
            </div>
          </div>
          <div
            className={`font-bold text-3xl tracking-tight ${netIsPositive ? "text-blue-600 dark:text-blue-500" : "text-orange-600 dark:text-orange-500"}`}
          >
            {formatCurrency(stats.netIncome)}
          </div>
          <div className="mt-2 text-muted-foreground text-xs">In the Bank</div>
        </CardContent>
      </Card>
    </div>
  );
}

async function TransactionsContent() {
  // Directly call the function instead of making HTTP request
  // This works better in Cloudflare Workers and avoids network issues
  // Works the same on both port 3000 (Next.js dev) and port 8787 (Wrangler dev)
  const cfEnv = await getCloudflareEnv();
  const [transactions, financialSummary] = await Promise.all([
    fetchQuickBooksTransactions(cfEnv),
    fetchQuickBooksFinancialSummary(cfEnv),
  ]);

  if (transactions.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="mb-2 text-lg text-muted-foreground">
          No transactions found
        </div>
        <div className="text-muted-foreground text-xs">
          If you see invalid_grant errors in the logs, you may need to
          re-authenticate via the admin setup route.
        </div>
      </div>
    );
  }

  // Use financial summary from QuickBooks if available, otherwise calculate from transactions
  let stats: TransactionStats;
  if (financialSummary) {
    stats = {
      expenses: financialSummary.expenses,
      income: financialSummary.income,
      netIncome: financialSummary.netIncome,
      total: transactions.length,
    };
  } else {
    stats = { expenses: 0, income: 0, netIncome: 0, total: 0 };
    for (const transaction of transactions) {
      stats.total++;
      if (transaction.amount >= 0) {
        stats.income += transaction.amount;
      } else {
        stats.expenses += Math.abs(transaction.amount);
      }
      stats.netIncome = stats.income - stats.expenses;
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <SummaryStats stats={stats} />

      {/* Transactions List with expand/collapse */}
      <TransactionsList transactions={transactions} />
    </div>
  );
}

function TransactionsSection() {
  return (
    <Card className="border-2">
      <CardContent className="p-0">
        <Suspense fallback={<TransactionsSkeleton />}>
          <TransactionsContent />
        </Suspense>
      </CardContent>
    </Card>
  );
}

export default function OpenPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <section className="py-12 sm:py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4">
            {/* Hero Section */}
            <HeroSection />

            <div className="space-y-12">
              {/* Metrics Section */}
              <div>
                <h2 className="mb-6 font-bold text-2xl tracking-tight">
                  Monthly metrics
                </h2>
                <Suspense
                  fallback={
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }, (_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <Skeleton className="mb-2 h-4 w-24" />
                            <Skeleton className="h-8 w-32" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  }
                >
                  <MetricsSection />
                </Suspense>
              </div>

              {/* Financial Section */}
              <div>
                <h2 className="mb-6 font-bold text-2xl tracking-tight">
                  Financial transparency
                </h2>
                <TransactionsSection />
              </div>

              {/* Updates Section */}
              <div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold text-2xl tracking-tight">
                      Community updates
                    </h2>
                    <p className="mt-1 text-muted-foreground text-sm">
                      Recent news and milestones from our community
                    </p>
                  </div>
                  <Link
                    className="flex items-center gap-1 self-start text-muted-foreground text-sm transition-colors hover:text-foreground sm:self-auto"
                    href="/blog"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <Suspense
                  fallback={
                    <div className="space-y-3">
                      {Array.from({ length: 3 }, (_, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <Skeleton className="mb-2 h-5 w-32" />
                            <Skeleton className="h-4 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  }
                >
                  <UpdatesSection />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}