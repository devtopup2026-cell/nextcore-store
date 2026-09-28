import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { products } from "../data/products";

async function main() {
  // โหลด Prisma หลังจากโหลด .env.local แล้ว
  const { prisma } = await import("../lib/prisma");

  console.log(`Found ${products.length} products`);

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        id: product.id,
      },

      update: {
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        stock: product.stock,
        description: product.description ?? null,
        updatedAt: new Date(),
      },

      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        stock: product.stock,
        description: product.description ?? null,
      },
    });
  }

  console.log("✅ Products seeded successfully");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});