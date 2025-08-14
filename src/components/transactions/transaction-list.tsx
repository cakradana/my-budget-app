"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: Date;
  categoryId: string | null;
  categoryName: string | null;
  categoryType: string | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  searchParams: {
    search?: string;
    category?: string;
    type?: "income" | "expense";
    startDate?: string;
    endDate?: string;
    page?: string;
  };
}

export function TransactionList({
  transactions,
  categories,
  currentPage,
  totalPages,
  searchParams,
}: TransactionListProps) {
  const router = useRouter();
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });

    if (page > 1) {
      params.set("page", page.toString());
    }

    const queryString = params.toString();
    return queryString
      ? `/dashboard/transactions?${queryString}`
      : "/dashboard/transactions";
  };

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No transactions found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or add a new transaction
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transactions */}
      <div className="space-y-2">
        {transactions.map(transaction => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    transaction.amount > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <p className="font-medium">
                    {transaction.categoryName || "Uncategorized"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)} • {transaction.note}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`text-right font-medium ${
                  transaction.amount > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {transaction.amount > 0 ? "+" : ""}
                {formatCurrency(transaction.amount)}
              </div>

              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTransaction(transaction)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingTransaction(transaction)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(buildPageUrl(currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(buildPageUrl(currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          categories={categories}
          open={!!editingTransaction}
          onOpenChange={(open: boolean) => !open && setEditingTransaction(null)}
        />
      )}

      {/* Delete Dialog */}
      {deletingTransaction && (
        <DeleteTransactionDialog
          transaction={deletingTransaction}
          open={!!deletingTransaction}
          onOpenChange={(open: boolean) =>
            !open && setDeletingTransaction(null)
          }
        />
      )}
    </div>
  );
}
