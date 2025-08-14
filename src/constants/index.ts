// Application constants

export const APP_NAME = "Budget Tracker";
export const APP_DESCRIPTION = "Track your income and expenses efficiently";

export const CURRENCY = "IDR";
export const LOCALE = "id-ID";

export const DATE_FORMAT = "yyyy-MM-dd";
export const DISPLAY_DATE_FORMAT = "dd MMM yyyy";

export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
} as const;

export const CATEGORY_TYPES = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  OTHER: "other",
} as const;

export const BUDGET_PERIODS = {
  WEEK: "week",
  MONTH: "month",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;
