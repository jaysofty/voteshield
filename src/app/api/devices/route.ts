import { NextResponse } from "next/server";

import { getDevices } from "@/repositories/voteshield.repository";

export async function GET() {
  try {
    const devices = await getDevices();

    return NextResponse.json({
      success: true,
      devices,
    });
  } catch (error) {
    console.error("Get devices error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load voting devices.",
      },
      { status: 500 },
    );
  }
}