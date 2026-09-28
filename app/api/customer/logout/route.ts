import { NextResponse } from "next/server";

import { deleteCustomerSession } from "@/lib/customer-session";

export async function POST() {
  try {
    await deleteCustomerSession();

    return NextResponse.json({
      success: true,
      message: "ออกจากระบบสำเร็จ",
    });
  } catch (error) {
    console.error("CUSTOMER_LOGOUT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถออกจากระบบได้",
      },
      { status: 500 }
    );
  }
}