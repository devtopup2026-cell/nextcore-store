import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

async function main() {
  const { prisma } = await import("./lib/prisma");

  const PRIMARY_CUSTOMER_ID =
    "cmu00ajhk0002h8uv8jetf9j5";

  const DUPLICATE_CUSTOMER_ID =
    "cmu0060em0000h8uv6qjw2jq9";

  await prisma.$transaction(async (tx) => {
    // ============================================
    // ตรวจ Customer หลัก
    // ============================================

    const primaryCustomer =
      await tx.customer.findUnique({
        where: {
          id: PRIMARY_CUSTOMER_ID,
        },
      });

    if (!primaryCustomer) {
      throw new Error(
        "Primary customer not found"
      );
    }

    // ============================================
    // ตรวจ Customer ที่จะรวม
    // ============================================

    const duplicateCustomer =
      await tx.customer.findUnique({
        where: {
          id: DUPLICATE_CUSTOMER_ID,
        },
      });

    if (!duplicateCustomer) {
      throw new Error(
        "Duplicate customer not found"
      );
    }

    // ============================================
    // ย้าย Order ทั้งหมดไป Customer หลัก
    // ============================================

    const movedOrders =
      await tx.order.updateMany({
        where: {
          customerId: DUPLICATE_CUSTOMER_ID,
        },

        data: {
          customerId: PRIMARY_CUSTOMER_ID,
        },
      });

    console.log(
      `Moved orders: ${movedOrders.count}`
    );

    // ============================================
    // ลบ Customer ที่ซ้ำ
    // ============================================

    await tx.customer.delete({
      where: {
        id: DUPLICATE_CUSTOMER_ID,
      },
    });
  });

  // ============================================
  // ตรวจผลหลังรวม
  // ============================================

  const customer =
    await prisma.customer.findUnique({
      where: {
        id: PRIMARY_CUSTOMER_ID,
      },

      include: {
        orders: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  console.log("\n✅ Customer merge completed");

  console.log(
    "Customer:",
    customer?.fullName
  );

  console.log(
    "Email:",
    customer?.email
  );

  console.log(
    "Orders:",
    customer?.orders.length
  );

  for (const order of customer?.orders ?? []) {
    console.log(
      `- ${order.id} | ${order.status} | ฿${order.total}`
    );
  }
}

main()
  .catch((error) => {
    console.error("❌ MERGE FAILED:", error);
  })
  .finally(() => process.exit());