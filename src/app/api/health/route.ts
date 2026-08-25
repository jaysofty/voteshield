import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb/session";

export async function GET() {
  try {
    const result = await runQuery<{ version: string }>(
      `
        RETURN "CognoDB connection successful" AS version
      `
    );

    return NextResponse.json({
      status: "healthy",
      database: result[0]?.version,
    });
  } catch (error) {
    console.error("CognoDB health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: "unavailable",
      },
      { status: 503 }
    );
  }
}