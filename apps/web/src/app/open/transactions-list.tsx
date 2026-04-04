"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

import type { QuickBooksTransaction } from "@/lib/integrations/quickbooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@atl/ui/components/badge";
import { Button } from "@atl/ui/components/button";
import { Card, CardContent } from "@atl/ui/components/card";

const INITIAL_DISPLAY_COUNT = 20;

interface TransactionsListProps {
  transactions: QuickBooksTransaction[];
}

function TransactionCard({
  transaction,
}: {
  transaction: QuickBooksTransaction;
}) {
  const vendorName =
    transaction.customerName || transaction.vendorName || "Unknown";
  const isPositive = transaction.amount >= 0;

  return (
    <Card className="sm:hidden">
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="text-sm font-medium">
            {formatDate(transaction.txnDate)}
          </div>
          <Badge
            className={`text-xs ${isPositive ? "" : "border-red-200 bg-red-50 text-red-500"}`}
            variant={isPositive ? "default" : "secondary"}
          >
            {formatCurrency(transaction.amount)}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">{vendorName}</div>
          {transaction.description && (
            <div className="text-muted-foreground line-clamp-2 text-xs">
              {transaction.description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: QuickBooksTransaction;
}) {
  const vendorName = transaction.customerName || transaction.vendorName || "-";
  const isPositive = transaction.amount >= 0;
  const transactionType = transaction.type;

  return (
    <tr className="group hover:bg-muted/30 border-b transition-colors last:border-0">
      <td className="px-6 py-4">
        <div className="text-sm font-medium">
          {formatDate(transaction.txnDate)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-green-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 flex-shrink-0 text-red-500" />
          )}
          <div>
            <div className="text-sm font-medium">{vendorName}</div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              {transactionType}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-muted-foreground max-w-md text-sm">
          {transaction.description || "-"}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <div
            className={`text-sm font-semibold ${
              isPositive
                ? "text-green-600 dark:text-green-500"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      </td>
    </tr>
  );
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = transactions.length > INITIAL_DISPLAY_COUNT;
  const displayedTransactions = showAll
    ? transactions
    : transactions.slice(0, INITIAL_DISPLAY_COUNT);
  const remainingCount = transactions.length - INITIAL_DISPLAY_COUNT;

  return (
    <div className="space-y-4">
      {/* Mobile card layout */}
      <div className="grid gap-4 sm:hidden">
        {displayedTransactions.map((transaction) => (
          <TransactionCard
            key={`${transaction.type}-${transaction.id}`}
            transaction={transaction}
          />
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="bg-card hidden overflow-hidden rounded-lg border-2 sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                  Date
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                  Vendor / Donor
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                  Category
                </th>
                <th className="text-muted-foreground px-6 py-4 text-right text-xs font-semibold tracking-wider uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {displayedTransactions.map((transaction) => (
                <TransactionRow
                  key={`${transaction.type}-${transaction.id}`}
                  transaction={transaction}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="flex justify-center pt-6 pb-6">
          <Button
            className="flex items-center gap-2"
            onClick={() => setShowAll(!showAll)}
            variant="outline"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {remainingCount} More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
