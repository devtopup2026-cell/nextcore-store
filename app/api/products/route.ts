import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: {
        id: "asc",
      },
    });

    const normalizedProducts = products.map((product) => ({
      ...product,

      thumbnail:
        product.thumbnail || product.image,

      images:
        product.images?.length > 0
          ? product.images
          : [product.image],

      rating:
        product.rating ?? 0,

      reviewCount:
        product.reviewCount ?? 0,

      featured:
        product.featured ?? false,

      isNew:
        product.isNew ?? false,
    }));

    return NextResponse.json({
      success: true,
      products: normalizedProducts,
    });
  } catch (error) {
    console.error(
      "PUBLIC PRODUCTS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load products",
      },
      {
        status: 500,
      }
    );
  }
}