import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const { prisma } = await import("../lib/prisma");

  const orders = await prisma.order.findMany({
    include: {
      customer: true,
    },
  });

  console.log(`Found ${orders.length} orders`);

  let updated = 0;

  for (const order of orders) {
    const needsBackfill =
      !order.recipientName ||
      !order.recipientEmail ||
      !order.recipientPhone ||
      !order.shippingAddress ||
      !order.shippingPostalCode;

    if (!needsBackfill) {
      console.log(`SKIP: ${order.id}`);
      continue;
    }

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        recipientName:
          order.recipientName || order.customer.fullName,

        recipientEmail:
          order.recipientEmail || order.customer.email,

        recipientPhone:
          order.recipientPhone || order.customer.phone,

        shippingAddress:
          order.shippingAddress || order.customer.address,

        shippingPostalCode:
          order.shippingPostalCode || order.customer.postalCode,
      },
    });

    updated++;

    console.log(`UPDATED: ${order.id}`);
  }

  console.log("");
  console.log(`Backfill complete.`);
  console.log(`Updated: ${updated}`);
  console.log(`Total: ${orders.length}`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });