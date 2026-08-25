import { NextResponse } from "next/server";
import { getInvestigation } from "@/repositories/voteshield.repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "Attempt ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const investigation = await getInvestigation(id);

    if (!investigation) {
      return NextResponse.json(
        {
          message: `Voting attempt ${id} was not found.`,
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      investigation,
    });
  } catch (error) {
    console.error("Investigation API error:", error);

    return NextResponse.json(
      {
        message: "Unable to investigate voting activity.",
      },
      {
        status: 503,
      },
    );
  }
}