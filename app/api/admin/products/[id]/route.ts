import { updateCatalogProduct } from "@/lib/product-catalog";
import { productIdSchema } from "@/lib/product-input";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (
    session.role !== "ADMIN" &&
    session.role !== "SUPER_ADMIN"
  ) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Forbidden",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    session,
  };
}

// ======================================================
// GET - Product by ID
// ======================================================

export async function GET(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await context.params;
    const parsedId = productIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    const productId = parsedId.data;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load product",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// PATCH - Update Product
// ======================================================

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await context.params;
    const parsedId = productIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    const productId = parsedId.data;

    const body: unknown = await req.json().catch(() => null);
    const result = await updateCatalogProduct(prisma, productId, body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

// ======================================================
// DELETE - Delete Product
// ======================================================

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await context.params;
    const parsedId = productIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    const productId = parsedId.data;
    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const orderItemCount =
      await prisma.orderItem.count({
        where: {
          productId,
        },
      });

    if (orderItemCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "สินค้านี้มีประวัติคำสั่งซื้ออยู่ จึงไม่สามารถลบได้",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
      },
      {
        status: 500,
      }
    );
  }
}