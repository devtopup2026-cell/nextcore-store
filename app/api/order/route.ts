import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { getCustomerSession } from "@/lib/customer-session";

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// ======================================================
// POST - Create Order
// ======================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const member = await getCustomerSession();

const {
  id,
  customer,
  items,
  total,
  paymentMethod,
  paymentSlip,
} = body;

    // ตรวจข้อมูลเบื้องต้น

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // ======================================================
// ป้องกัน Order ซ้ำ
// ======================================================

const existingOrder = await prisma.order.findUnique({
  where: {
    id,
  },
});

if (existingOrder) {
  return NextResponse.json(
    {
      success: false,
      error: "Order already exists",
    },
    {
      status: 409,
    }
  );
}


    if (!customer) {
      return NextResponse.json(
        { error: "Customer information is required" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order items are required" },
        { status: 400 }
      );
    }


    // ======================================================
    // ตรวจว่าสินค้าทั้งหมดมีอยู่ใน Database
    // ======================================================

    const productIds = items.map(
      (item: { productId: number }) => item.productId
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products were not found" },
        { status: 400 }
      );
    }

    // ======================================================
// ตรวจ Quantity + ใช้ราคาจริงจาก Database
// ======================================================

const validatedItems: { productId: number; quantity: number; price: number }[] = [];

for (const item of items) {
  const product = products.find(
    (product) => product.id === item.productId
  );

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 400 }
    );
  }

  if (!product.isActive) {
    return NextResponse.json(
      { error: `${product.name} ปิดขายชั่วคราว กรุณานำออกจากตะกร้า` },
      { status: 409 }
    );
  }

  const quantity = Number(item.quantity);

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return NextResponse.json(
      { error: "Invalid product quantity" },
      { status: 400 }
    );
  }

  if (quantity > product.stock) {
    return NextResponse.json(
      {
        error: `${product.name} มีสินค้าไม่เพียงพอ`,
      },
      { status: 400 }
    );
  }

  validatedItems.push({
    productId: product.id,
    quantity,
    price: product.price,
  });
}

const calculatedTotal = validatedItems.reduce(
  (sum, item) =>
    sum + item.price * item.quantity,
  0
);


    // ======================================================
    // สร้าง / หา Customer
    // ======================================================

let savedCustomer;

if (member) {
  // ======================================================
  // MEMBER CHECKOUT
  // ใช้ Customer จาก Session โดยตรง
  // ======================================================

  savedCustomer = await prisma.customer.update({
    where: {
      id: member.id,
    },
    data: {
      fullName: customer.fullname,
      phone: customer.phone,
      address: customer.address,
      postalCode: customer.postalCode,
    },
  });
} else {
  // ======================================================
  // GUEST CHECKOUT
  // ใช้ Email หา / สร้าง Customer เหมือนระบบเดิม
  // ======================================================

  const normalizedEmail = String(customer.email)
    .trim()
    .toLowerCase();

  const existingCustomer =
    await prisma.customer.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  savedCustomer = existingCustomer
    ? await prisma.customer.update({
        where: {
          id: existingCustomer.id,
        },
        data: {
          fullName: customer.fullname,
          phone: customer.phone,
          address: customer.address,
          postalCode: customer.postalCode,
        },
      })
    : await prisma.customer.create({
        data: {
          fullName: customer.fullname,
          email: normalizedEmail,
          phone: customer.phone,
          address: customer.address,
          postalCode: customer.postalCode,
        },
      });
}


    // ======================================================
    // สร้าง Order + OrderItem
    // ======================================================

    const order = await prisma.$transaction(async (tx) => {
      // Serialize checkout with changes to the product's sale status.
      const activeProducts = await tx.$queryRaw<{ id: number }[]>`
        SELECT "id" FROM "Product"
        WHERE "id" IN (${Prisma.join(productIds)}) AND "isActive" = true
        ORDER BY "id" FOR SHARE
      `;

      if (activeProducts.length !== productIds.length) return null;

      return tx.order.create({
        data: {
          id,

          customerId: savedCustomer.id,

          // ======================================================
          // Shipping Snapshot
          // เก็บข้อมูลผู้รับ ณ เวลาที่สร้าง Order
          // ======================================================

          recipientName: savedCustomer.fullName,
          recipientEmail: savedCustomer.email,
          recipientPhone: savedCustomer.phone,
          shippingAddress: savedCustomer.address,
          shippingPostalCode: savedCustomer.postalCode,

          total: calculatedTotal,

          paymentMethod,

          paymentSlip: paymentSlip || null,

          status: "Pending Payment",

          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
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
    });

    if (!order) {
      return NextResponse.json(
        { error: "สินค้าในตะกร้าปิดขายแล้ว กรุณาตรวจสอบตะกร้าอีกครั้ง" },
        { status: 409 }
      );
    }


    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {

    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
      },
      { status: 500 }
    );
  }
}


// ======================================================
// GET - Get All Orders
// ======================================================

export async function GET() {
  try {

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

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
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


    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error) {

    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}


// ======================================================
// PATCH - Update Order Status
// ======================================================

// ======================================================
// PATCH - Update Order Status
// ======================================================

export async function PATCH(req: Request) {
  try {

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

    const body = await req.json();

    const {
      id,
      status,
    } = body;

    // ======================================================
    // ตรวจข้อมูล
    // ======================================================

    if (!id) {
      return NextResponse.json(
        {
          error: "Order ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          error: "Order status is required",
        },
        {
          status: 400,
        }
      );
    }


    // ======================================================
    // Status ที่อนุญาต
    // ======================================================

    const allowedStatuses = [
      "Pending Payment",
      "Paid",
      "Shipping",
      "Completed",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid order status",
        },
        {
          status: 400,
        }
      );
    }


    // ======================================================
    // Transaction
    // ======================================================

const result = await prisma.$transaction(
  async (tx: TransactionClient) => {

      // หา Order พร้อมรายการสินค้า
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

        for (const item of existingOrder.items) {

          // ลด Stock เฉพาะเมื่อ Stock เพียงพอ
          const updatedProduct =
            await tx.product.updateMany({
              where: {
                id: item.productId,

                stock: {
                  gte: item.quantity,
                },
              },

              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });


          // Stock ไม่พอ
          if (updatedProduct.count === 0) {
            throw new Error(
              `INSUFFICIENT_STOCK:${item.productId}`
            );
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
    });


    return NextResponse.json({
      success: true,
      order: result,
    });

  } catch (error) {

    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );


    // ======================================================
    // Order ไม่พบ
    // ======================================================

    if (
      error instanceof Error &&
      error.message === "ORDER_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }


    // ======================================================
    // Stock ไม่พอ
    // ======================================================

    if (
      error instanceof Error &&
      error.message.startsWith(
        "INSUFFICIENT_STOCK:"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "สินค้าใน Stock ไม่เพียงพอ",
        },
        {
          status: 400,
        }
      );
    }


    // ======================================================
    // เปลี่ยน Order Status ไม่ถูกต้อง
    // ======================================================

    if (
      error instanceof Error &&
      error.message.startsWith(
    "INVALID_STATUS_TRANSITION:"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "ไม่สามารถเปลี่ยนสถานะ Order แบบนี้ได้",
          },
          {
            status: 400,
          }
        );
      }


    // ======================================================
    // Error อื่น ๆ
    // ======================================================

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order status",
      },
      {
        status: 500,
      }
    );
  }
}