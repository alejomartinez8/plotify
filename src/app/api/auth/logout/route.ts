import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Clear authentication cookie
    const cookieStore = await cookies();
    cookieStore.delete("admin-auth");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}