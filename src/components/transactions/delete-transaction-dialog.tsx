"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Loader2, AlertTriangle } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  categoryName?: string | null;
}

interface DeleteTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: DeleteTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      // TODO: Add toast notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Delete Transaction</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {transaction.categoryName || "Uncategorized"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transaction.date}
                </p>
                {transaction.note && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {transaction.note}
                  </p>
                )}
              </div>
              <div
                className={`font-medium ${
                  transaction.amount > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {transaction.amount > 0 ? "+" : ""}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
