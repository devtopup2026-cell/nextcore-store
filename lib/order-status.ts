import { Prisma, type PrismaClient } from "@prisma/client";

export function updateOrderStatus(db: PrismaClient, id: string, status: string) {
return db.$transaction(
  async (tx) => {

      // หา Order พร้อมรายการสินค้า
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "Order" WHERE "id" = ${id} FOR UPDATE
      `;
      if (!locked.length) throw new Error("ORDER_NOT_FOUND");

      const existingOrder = await tx.order.findUnique({
        where: {
          id,
        },

        include: {
          items: true,
        },
        }
);


      if (!existingOrder) {
        throw new Error("ORDER_NOT_FOUND");
      }



      // ======================================================
      // ตรวจสอบการเปลี่ยน Order Status
      // ======================================================

      const allowedTransitions: Record<string, string[]> = {
      "Pending Payment": ["Paid", "Rejected"],
        "Paid": ["Shipping", "Rejected"],
        "Shipping": ["Completed"],
        "Completed": [],
        "Rejected": [],
      };

      const currentStatus = existingOrder.status;

      if (
        status !== currentStatus &&
        !allowedTransitions[currentStatus]?.includes(status)
      ) {
        throw new Error(
          `INVALID_STATUS_TRANSITION:${currentStatus}:${status}`
        );
      }

      // ======================================================
      // ป้องกันการ Approve ซ้ำ
      // ======================================================

      if (
        status === "Paid" &&
        existingOrder.status === "Paid"
      ) {
        return await tx.order.findUnique({
          where: {
            id,
          },

          include: {
            customer: true,

            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }


      // ======================================================
      // Pending Payment → Paid
      // ตัด Stock
      // ======================================================

      if (
        existingOrder.status === "Pending Payment" &&
        status === "Paid"
      ) {

        const quantities = new Map<number, number>();
        for (const item of existingOrder.items) {
          quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
        }

        const productIds = [...quantities.keys()].sort((a, b) => a - b);
        if (productIds.length > 0) {
          const products = await tx.$queryRaw<{ id: number; stock: number }[]>`
            SELECT "id", "stock" FROM "Product"
            WHERE "id" IN (${Prisma.join(productIds)})
            ORDER BY "id" FOR NO KEY UPDATE
          `;
          const stocks = new Map(products.map(({ id, stock }) => [id, stock]));
          for (const productId of productIds) {
            if ((stocks.get(productId) ?? -1) < quantities.get(productId)!) {
              throw new Error(`INSUFFICIENT_STOCK:${productId}`);
            }
          }
          for (const productId of productIds) {
            await tx.product.update({
              where: { id: productId },
              data: { stock: { decrement: quantities.get(productId)! } },
            });
          }
        }
      }

      // ======================================================
// Paid → Rejected
// คืน Stock
// ======================================================

if (
  existingOrder.status === "Paid" &&
  status === "Rejected"
) {
  for (const item of existingOrder.items) {
    await tx.product.update({
      where: {
        id: item.productId,
      },

      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }
}


      // ======================================================
      // Update Order Status
      // ======================================================

      return await tx.order.update({
        where: {
          id,
        },

        data: {
          status,
        },

        include: {
          customer: true,

          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
}
