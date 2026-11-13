import { Prisma, type PrismaClient } from "@prisma/client";
import { isProductCategoryAllowed, isProductSlugAllowed, productIdSchema, productInput, productStockSchema } from "./product-input";

function reply(body: object, options?: { status: number }) {
  return { body, status: options?.status ?? 200 };
}

export async function createCatalogProduct(prisma: PrismaClient, body: unknown) {
  try {
    const input = productInput.extend({ id: productIdSchema }).safeParse(body);
    if (!input.success) {
      return reply({ success: false, error: input.error.issues[0].path.join(".") + ": " + input.error.issues[0].message }, { status: 400 });
    }
    if (!isProductCategoryAllowed(input.data.category)) {
      return reply({ success: false, error: "Invalid category" }, { status: 400 });
    }

    if (!isProductSlugAllowed(input.data.slug)) {
      return reply({ success: false, error: "Invalid slug" }, { status: 400 });
    }

    const product = await prisma.product.create({ data: input.data });

    return reply(
      {
        success: true,
        product,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return reply({ success: false, error: "Product ID or slug already exists" }, { status: 409 });
    }
    console.error("CREATE PRODUCT ERROR:", error);

    return reply(
      {
        success: false,
        error: "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}

export async function updateCatalogProduct(prisma: PrismaClient, productId: number, body: unknown) {
  try {
    if (body && typeof body === "object" && Object.keys(body).length === 1 && "isActive" in body) {
      if (typeof body.isActive !== "boolean") {
        return reply(
          { success: false, error: "Invalid product status" },
          { status: 400 }
        );
      }

      const result = await prisma.product.updateMany({
        where: { id: productId },
        data: { isActive: body.isActive },
      });

      if (result.count === 0) {
        return reply(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }

      return reply({ success: true, isActive: body.isActive });
    }

    const input = productInput.extend({ expectedStock: productStockSchema.optional() }).safeParse(body);
    if (!input.success) {
      return reply({ success: false, error: input.error.issues[0].path.join(".") + ": " + input.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { category: true, slug: true },
    });
    if (!existing) return reply({ success: false, error: "Product not found" }, { status: 404 });
    if (!isProductCategoryAllowed(input.data.category, existing.category)) {
      return reply({ success: false, error: "Invalid category" }, { status: 400 });
    }

    if (!isProductSlugAllowed(input.data.slug, existing.slug)) {
      return reply({ success: false, error: "Invalid slug" }, { status: 400 });
    }

    const { expectedStock, stock, ...details } = input.data;
    const changesStock = expectedStock === undefined || expectedStock !== stock;
    const product = await prisma.product.update({
      where: { id: productId, ...(changesStock && expectedStock !== undefined ? { stock: expectedStock } : {}) },
      data: { ...details, ...(changesStock ? { stock } : {}) },
    });

    return reply({
      success: true,
      product,
    });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return reply({ success: false, error: "Slug already exists" }, { status: 409 });
      if (error.code === "P2025") {
        const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
        return product
          ? reply({ success: false, error: "Stock changed. Reload the product before updating stock." }, { status: 409 })
          : reply({ success: false, error: "Product not found" }, { status: 404 });
      }
    }
    console.error("UPDATE PRODUCT ERROR:", error);

    return reply(
      {
        success: false,
        error: "Failed to update product",
      },
      {
        status: 500,
      }
    );
  }
}
