"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Filter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface TransactionFiltersProps {
  categories: Category[];
  searchParams: {
    search?: string;
    category?: string;
    type?: "income" | "expense";
    startDate?: string;
    endDate?: string;
    page?: string;
  };
}

export function TransactionFilters({
  categories,
  searchParams,
}: TransactionFiltersProps) {
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: searchParams.search || "",
    category: searchParams.category || "",
    type: searchParams.type || "",
    startDate: searchParams.startDate || "",
    endDate: searchParams.endDate || "",
  });

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change
    params.delete("page");

    const queryString = params.toString();
    const url = queryString
      ? `/dashboard/transactions?${queryString}`
      : "/dashboard/transactions";

    router.push(url);
  };

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" values back to empty strings for URL
    const urlValue = value === "all" ? "" : value;
    const newFilters = { ...filters, [key]: urlValue };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      search: "",
      category: "",
      type: "",
      startDate: "",
      endDate: "",
    };
    setFilters(newFilters);
    router.push("/dashboard/transactions");
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={e => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value: string) =>
                handleFilterChange("category", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={filters.type || "all"}
              onValueChange={(value: string) =>
                handleFilterChange("type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">From Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={e => handleFilterChange("startDate", e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">To Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={e => handleFilterChange("endDate", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
