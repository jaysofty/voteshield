import { NextResponse } from "next/server";
import { updateAlertStatus } from "@/repositories/voteshield.repository";

const VALID_STATUSES = [
  "OPEN",
  "INVESTIGATING",
  "RESOLVED",
] as const;

type AlertStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "Alert ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const status = body.status as string;

    if (!VALID_STATUSES.includes(status as AlertStatus)) {
      return NextResponse.json(
        {
          message:
            "Invalid alert status. Expected OPEN, INVESTIGATING or RESOLVED.",
        },
        {
          status: 400,
        },
      );
    }

    const alert = await updateAlertStatus(
      id,
      status as AlertStatus,
    );

    if (!alert) {
      return NextResponse.json(
        {
          message: `Alert ${id} was not found.`,
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      alert,
    });
  } catch (error) {
    console.error("Update alert status error:", error);

    return NextResponse.json(
      {
        message: "Unable to update alert status.",
      },
      {
        status: 503,
      },
    );
  }
}