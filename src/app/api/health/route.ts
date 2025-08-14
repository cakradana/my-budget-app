import { errorResponse, successResponse } from "@/lib/api-response";
import { checkDatabaseConnection } from "@/lib/db";

export async function GET() {
  try {
    // Check database connection
    const isDatabaseHealthy = await checkDatabaseConnection();

    // Get system information
    const healthData = {
      status: isDatabaseHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: isDatabaseHealthy ? "connected" : "disconnected",
        },
      },
      version: process.env.npm_package_version || "unknown",
    };

    if (!isDatabaseHealthy) {
      return errorResponse(
        new Error("Database connection failed"),
        503 // Service Unavailable
      );
    }

    return successResponse(healthData, "System is healthy");
  } catch (error) {
    return errorResponse(error, 500);
  }
}
