import { NextRequest, NextResponse } from "next/server";
import { getLots, createLot } from "@/lib/database/lots";

export async function GET() {
  try {
    const lots = await getLots();
    return NextResponse.json(lots);
  } catch (error) {
    console.error("Error fetching lots:", error);
    return NextResponse.json(
      { error: "Failed to fetch lots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, owner } = body;

    if (!id || !owner) {
      return NextResponse.json(
        { error: "ID and owner are required" },
        { status: 400 }
      );
    }

    const lot = await createLot({ id, owner });

    if (!lot) {
      return NextResponse.json(
        { error: "Failed to create lot" },
        { status: 500 }
      );
    }

    return NextResponse.json(lot, { status: 201 });
  } catch (error) {
    console.error("Error creating lot:", error);
    return NextResponse.json(
      { error: "Failed to create lot" },
      { status: 500 }
    );
  }
}
