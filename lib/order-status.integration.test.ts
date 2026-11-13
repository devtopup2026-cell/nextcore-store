import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { updateOrderStatus } from "./order-status";

test("NEXTCORE order status on local PostgreSQL", async (suite) => {
  const raw = process.env.NEXTCORE_TEST_DATABASE_URL;
  assert.ok(raw, "Set NEXTCORE_TEST_DATABASE_URL in the test Terminal");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    assert.fail("Invalid local test database URL");
  }
  assert.ok(url.protocol === "postgresql:" && url.hostname === "127.0.0.1" &&
    url.port === "5433" && url.pathname === "/nextcore_test" &&
    url.username === "nextcore_test_user" && url.password && !url.search && !url.hash,
  "Expected the dedicated NEXTCORE local test database");

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url.href }) });
  try {
    const [target] = await db.$queryRaw<{ ok: boolean }[]>`
      SELECT (current_database() = 'nextcore_test' AND current_user = 'nextcore_test_user'
        AND host(inet_server_addr()) = '127.0.0.1' AND inet_server_port() = 5433) AS ok
    `;
    assert.ok(target?.ok, "PostgreSQL target does not match local test settings");

    const tables = await db.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
    `;
    for (const name of ["Product", "Customer", "Order", "OrderItem", "AdminUser", "_prisma_migrations"]) {
      assert.ok(tables.some(({ tablename }) => tablename === name), "Missing table: " + name);
    }
    const [history] = await db.$queryRaw<{ applied: number; unfinished: number }[]>`
      SELECT count(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL)::int AS applied,
             count(*) FILTER (WHERE finished_at IS NULL AND rolled_back_at IS NULL)::int AS unfinished
      FROM public._prisma_migrations
    `;
    assert.equal(history.applied, 8);
    assert.equal(history.unfinished, 0);
    await db.product.findFirst({ select: { isActive: true } });

    async function fixture(stocks: number[], run: (id: string, ids: number[]) => Promise<void>) {
      const id = randomUUID();
      const email = id + "@example.test";
      const ids: number[] = [];
      try {
        const customer = await db.customer.create({
          data: { email, fullName: "Test", phone: "000", address: "Test", postalCode: "00000" },
        });
        for (const [index, stock] of stocks.entries()) {
          const productId = -Number.parseInt(randomUUID().slice(0, 7), 16) - 1;
          await db.product.create({
            data: { id: productId, name: "Test", slug: id + "-" + index, image: "", price: 100, stock },
          });
          ids.push(productId);
        }
        await db.order.create({
          data: {
            id, customerId: customer.id, recipientName: customer.fullName,
            recipientEmail: email, recipientPhone: customer.phone,
            shippingAddress: customer.address, shippingPostalCode: customer.postalCode,
            total: ids.length * 200, paymentMethod: "Bank Transfer", status: "Pending Payment",
            items: { create: ids.map((productId) => ({ productId, quantity: 2, price: 100 })) },
          },
        });
        await run(id, ids);
      } finally {
        await db.$transaction([
          db.orderItem.deleteMany({ where: { orderId: id } }),
          db.order.deleteMany({ where: { id } }),
          db.product.deleteMany({ where: { id: { in: ids } } }),
          db.customer.deleteMany({ where: { email } }),
        ]);
      }
    }

    async function check(id: string, ids: number[], status: string, expected: number[]) {
      assert.equal((await db.order.findUniqueOrThrow({ where: { id } })).status, status);
      const stocks = await Promise.all(ids.map(async (id) =>
        (await db.product.findUniqueOrThrow({ where: { id } })).stock));
      assert.deepEqual(stocks, expected);
      assert.ok(stocks.every((stock) => stock >= 0));
    }

    async function parallel(id: string, status: string) {
      const results = await Promise.allSettled([
        updateOrderStatus(db, id, status),
        updateOrderStatus(db, id, status),
      ]);
      assert.deepEqual(results.map((result) => result.status), ["fulfilled", "fulfilled"]);
    }

    await suite.test("two approvals deduct stock once", () => fixture([10], async (id, ids) => {
      await parallel(id, "Paid");
      await check(id, ids, "Paid", [8]);
    }));

    await suite.test("repeat approval and parallel rejection", () => fixture([2], async (id, ids) => {
      await updateOrderStatus(db, id, "Paid");
      await updateOrderStatus(db, id, "Paid");
      await check(id, ids, "Paid", [0]);
      await parallel(id, "Rejected");
      await check(id, ids, "Rejected", [2]);
    }));

    await suite.test("rejecting a pending order leaves stock unchanged", () => fixture([2], async (id, ids) => {
      await updateOrderStatus(db, id, "Rejected");
      await check(id, ids, "Rejected", [2]);
    }));

    await suite.test("insufficient stock leaves the entire order unchanged", () => fixture([10, 1], async (id, ids) => {
      await assert.rejects(updateOrderStatus(db, id, "Paid"), /INSUFFICIENT_STOCK:/);
      await check(id, ids, "Pending Payment", [10, 1]);
    }));
  } finally {
    await db.$disconnect();
  }
});
