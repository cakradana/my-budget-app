/**
 * Standardized API response utilities
 */
import { NextResponse } from "next/server";

import { ZodError } from "zod";

import { AppError, handleError } from "./errors";

/**
 * Success response type
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Error response type
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    timestamp: string;
    field?: string;
    errors?: Array<{ field: string; message: string }>;
  };
}

/**
 * API Response type
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Create a success response
 */
export function successResponse<T = unknown>(
  data: T,
  message?: string,
  meta?: SuccessResponse<T>["meta"]
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta }),
    },
    { status: 200 }
  );
}

/**
 * Create a created response (201)
 */
export function createdResponse<T = unknown>(
  data: T,
  message: string = "Resource created successfully"
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: 201 }
  );
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create an error response
 */
export function errorResponse(
  error: unknown,
  statusCode?: number
): NextResponse<ErrorResponse> {
  // Handle AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          statusCode: error.statusCode,
          timestamp: error.timestamp,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors = error.errors.map(err => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Validation failed",
          statusCode: 400,
          timestamp: new Date().toISOString(),
          errors,
        },
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  const errorData = handleError(error);
  return NextResponse.json(errorData, {
    status: statusCode || errorData.error.statusCode,
  });
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse<SuccessResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);

  return successResponse(data, message, {
    page,
    limit,
    total,
    totalPages,
  });
}

/**
 * API response builder class for more complex responses
 */
export class ApiResponseBuilder<T = unknown> {
  private data?: T;
  private message?: string;
  private meta?: SuccessResponse<T>["meta"];
  private statusCode: number = 200;
  private headers: Record<string, string> = {};

  setData(data: T): this {
    this.data = data;
    return this;
  }

  setMessage(message: string): this {
    this.message = message;
    return this;
  }

  setMeta(meta: SuccessResponse<T>["meta"]): this {
    this.meta = meta;
    return this;
  }

  setStatusCode(statusCode: number): this {
    this.statusCode = statusCode;
    return this;
  }

  setHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  build(): NextResponse<SuccessResponse<T>> {
    const response = NextResponse.json<SuccessResponse<T>>(
      {
        success: true as const,
        data: this.data as T,
        ...(this.message && { message: this.message }),
        ...(this.meta && { meta: this.meta }),
      },
      { status: this.statusCode }
    );

    // Add custom headers
    Object.entries(this.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body) as T;
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new AppError("Invalid request body", 400);
  }
}

/**
 * Extract pagination params from URL
 */
export function getPaginationParams(url: URL): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10))
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Extract sort params from URL
 */
export function getSortParams(
  url: URL,
  allowedFields: string[] = []
): {
  sortBy: string;
  sortOrder: "asc" | "desc";
} {
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder =
    url.searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

  // Validate sort field if allowedFields is provided
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    throw new AppError(`Invalid sort field: ${sortBy}`, 400);
  }

  return { sortBy, sortOrder };
}

/**
 * Extract filter params from URL
 */
export function getFilterParams(
  url: URL,
  allowedFilters: string[] = []
): Record<string, string> {
  const filters: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    // Skip pagination and sort params
    if (["page", "limit", "sortBy", "sortOrder"].includes(key)) {
      return;
    }

    // Validate filter if allowedFilters is provided
    if (allowedFilters.length > 0 && !allowedFilters.includes(key)) {
      return;
    }

    filters[key] = value;
  });

  return filters;
}
