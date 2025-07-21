import { NextResponse } from "next/server";
import { getLots } from "@/lib/database/lots";

export async function GET() {
  try {
    const lots = await getLots();
    return NextResponse.json(lots);
  } catch (error) {
    console.error("Error fetching lots:", error);
    return NextResponse.json([], { status: 500 });
  }
}