import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.json({
    success: true,
    admin: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
}