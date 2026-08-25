import { NextResponse } from "next/server";

import { runQuery } from "@/lib/cognodb/session";

type PollingUnit = {
  id: string;
  name: string;
  ward: string | null;
};

type Device = {
  id: string;
  name: string;
};

export async function GET() {
  try {
    const pollingUnits = await runQuery<PollingUnit>(`
      MATCH (p:PollingUnit)

      RETURN
        toString(p.id) AS id,
        toString(p.name) AS name,
        toString(p.ward) AS ward

      ORDER BY p.name ASC
    `);

    const devices = await runQuery<Device>(`
      MATCH (d:Device)

      RETURN
        toString(d.id) AS id,
        toString(d.name) AS name

      ORDER BY d.name ASC
    `);

    return NextResponse.json({
      success: true,
      pollingUnits,
      devices,
    });
  } catch (error) {
    console.error(
      "[GET /api/voting-options]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load voting options.",
      },
      {
        status: 500,
      },
    );
  }
}