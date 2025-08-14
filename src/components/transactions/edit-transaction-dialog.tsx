"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Transaction {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface EditTransactionDialogProps {
  transaction: Transaction;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({
  transaction,
  categories,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount.toString(),
        categoryId: transaction.categoryId || "",
        date: transaction.date,
        note: transaction.note || "",
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const amount = parseFloat(data.amount);

      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          categoryId: data.categoryId,
          date: data.date,
          note: data.note || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating transaction:", error);
      // TODO: Add toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setValue("categoryId", categoryId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Update the transaction details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter amount (positive for income, negative for expense)"
                {...register("amount")}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                onValueChange={handleCategoryChange}
                value={selectedCategoryId}
              >
                <SelectTrigger
                  className={errors.categoryId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note about this transaction"
                {...register("note")}
              />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
