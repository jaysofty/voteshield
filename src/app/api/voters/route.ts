import { NextResponse } from "next/server";

import {
  getVoterCards,
  getVotingReferenceData,
} from "@/repositories/voteshield.repository";

export async function GET() {
  try {
    const [voters, references] = await Promise.all([
      getVoterCards(),
      getVotingReferenceData(),
    ]);

    return NextResponse.json({
      success: true,
      voters,
      ...references,
    });
  } catch (error) {
    console.error("Get voters error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load voters.",
      },
      { status: 500 },
    );
  }
}