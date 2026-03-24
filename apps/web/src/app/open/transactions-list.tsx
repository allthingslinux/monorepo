"use client";

import { Badge } from "@atl/ui/ui/badge";
import { Button } from "@atl/ui/ui/button";
import { Card, CardContent } from "@atl/ui/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

import type { QuickBooksTransaction } from "@/lib/integrations/quickbooks";
import { formatCurrency, formatDate } from "@/lib/utils";

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
          <div className="font-medium text-sm">
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
          <div className="font-medium text-sm">{vendorName}</div>
          {transaction.description && (
            <div className="line-clamp-2 text-muted-foreground text-xs">
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
    <tr className="group border-b transition-colors last:border-0 hover:bg-muted/30">
      <td className="px-6 py-4">
        <div className="font-medium text-sm">
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
            <div className="font-medium text-sm">{vendorName}</div>
            <div className="mt-0.5 text-muted-foreground text-xs">
              {transactionType}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="max-w-md text-muted-foreground text-sm">
          {transaction.description || "-"}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <div
            className={`font-semibold text-sm ${
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
      <div className="hidden overflow-hidden rounded-lg border-2 bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Vendor / Donor
                </th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
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