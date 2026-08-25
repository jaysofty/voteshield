import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createVotingAttempt } from "@/repositories/voteshield.repository";

const votingAttemptSchema = z.object({
  voterCardId: z.string().trim().min(1, "Voter card ID is required"),
  pollingUnitId: z.string().trim().min(1, "Polling unit is required"),
  deviceId: z.string().trim().min(1, "Device is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = votingAttemptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid voting attempt data.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await createVotingAttempt(parsed.data);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: result.flagged ? 201 : 201,
      },
    );
  } catch (error) {
    console.error("Create voting attempt error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to record voting attempt.";

    /*
     * Known validation/business errors.
     */
    if (
      message.includes("not found") ||
      message.includes("does not exist") ||
      message.includes("not active")
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to record voting attempt.",
      },
      { status: 500 },
    );
  }
}