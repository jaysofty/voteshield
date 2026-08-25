import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getRecentAttempts,
} from "@/repositories/voteshield.repository";

export async function GET() {
  try {
    const [stats, recentAttempts] = await Promise.all([
      getDashboardStats(),
      getRecentAttempts(),
    ]);

    return NextResponse.json({
      ...stats,
      recentAttempts,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        message: "Unable to load dashboard data.",
      },
      {
        status: 503,
      },
    );
  }
}