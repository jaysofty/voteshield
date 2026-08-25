import { NextResponse } from "next/server";
import { getAlerts } from "@/repositories/voteshield.repository";

export async function GET() {
  try {
    const alerts = await getAlerts();

    return NextResponse.json({
      alerts,
    });
  } catch (error) {
    console.error("Alerts API error:", error);

    return NextResponse.json(
      {
        message: "Unable to load alerts.",
      },
      {
        status: 503,
      },
    );
  }
}