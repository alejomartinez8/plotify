import { NextRequest, NextResponse } from "next/server";
import { getLotById, updateLot, deleteLot } from "@/lib/database/lots";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lot = await getLotById(params.id);

    if (!lot) {
      return NextResponse.json({ error: "Lot not found" }, { status: 404 });
    }

    return NextResponse.json(lot);
  } catch (error) {
    console.error("Error fetching lot:", error);
    return NextResponse.json({ error: "Failed to fetch lot" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { owner } = body;

    if (!owner) {
      return NextResponse.json({ error: "Owner is required" }, { status: 400 });
    }

    const lot = await updateLot(params.id, { owner });

    if (!lot) {
      return NextResponse.json(
        { error: "Failed to update lot" },
        { status: 500 }
      );
    }

    return NextResponse.json(lot);
  } catch (error) {
    console.error("Error updating lot:", error);
    return NextResponse.json(
      { error: "Failed to update lot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteLot(params.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete lot" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Lot deleted successfully" });
  } catch (error) {
    console.error("Error deleting lot:", error);
    return NextResponse.json(
      { error: "Failed to delete lot" },
      { status: 500 }
    );
  }
}
