import assert from "node:assert/strict";
import { randomInt, randomUUID } from "node:crypto";
import { test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createCatalogProduct, updateCatalogProduct } from "./product-catalog";

test("Product Catalog against dedicated PostgreSQL", async (suite) => {
  let url: URL;
  try {
    url = new URL(process.env.NEXTCORE_TEST_DATABASE_URL ?? "");
  } catch {
    assert.fail("Set NEXTCORE_TEST_DATABASE_URL in this Terminal");
  }
  assert.ok(url.protocol === "postgresql:" && url.host === "127.0.0.1:5433" &&
    url.pathname === "/nextcore_test" && url.username === "nextcore_test_user" &&
    url.password && !url.search && !url.hash, "Expected dedicated Local Test target");

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url.href }) });
  const key = randomUUID();
  const slug = "catalog-test-" + key;
  let fixtureStarted = false;

  try {
    const [target] = await db.$queryRaw<{ ok: boolean }[]>`
      SELECT (current_database() = 'nextcore_test' AND current_user = 'nextcore_test_user'
        AND host(inet_server_addr()) = '127.0.0.1' AND inet_server_port() = 5433) AS ok
    `;
    assert.ok(target?.ok, "Database target mismatch");
    const [history] = await db.$queryRaw<{ applied: number; unfinished: number }[]>`
      SELECT count(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL)::int AS applied,
             count(*) FILTER (WHERE finished_at IS NULL AND rolled_back_at IS NULL)::int AS unfinished
      FROM public._prisma_migrations
    `;
    assert.equal(history.applied, 8);
    assert.equal(history.unfinished, 0);

    const id = randomInt(1000000000, 2000000000);
    const data = { id, name: "Catalog fixture", slug, brand: "Test brand",
      category: "Computer Case", price: 125, stock: 5, image: "/products/test.webp" };
    const create = (body: object) => createCatalogProduct(db, body);
    const patch = (body: object) => updateCatalogProduct(db, id, body);

    assert.equal(await db.product.count({ where: { id: { in: [id, id + 1] } } }), 0, "Fixture IDs already exist");
    fixtureStarted = true;
    await suite.test("creates a product and stores its image", async () => {
      assert.equal((await create(data)).status, 201);
      const stored = await db.product.findUniqueOrThrow({ where: { slug } });
      assert.equal(stored.category, "CASE");
      assert.equal(stored.image, data.image);
    });

    await suite.test("rejects duplicate slug and ID, and invalid prices or stock", async () => {
      assert.equal((await create({ ...data, id: id + 1, slug: " " + slug + " " })).status, 409);
      assert.equal((await create({ ...data, slug: slug + "-duplicate-id" })).status, 409);
      for (const invalid of [{ price: -1 }, { stock: 1.5 }, { stock: -1 }]) {
        assert.equal((await create({ ...data, ...invalid })).status, 400);
        assert.equal((await patch({ ...data, ...invalid })).status, 400);
      }
    });

    await suite.test("edits price, stock, category and brand", async () => {
      assert.equal((await patch({ ...data, expectedStock: 5, stock: 8, price: 150,
        category: "Motherboard", brand: "Updated brand" })).status, 200);
      const stored = await db.product.findUniqueOrThrow({ where: { slug } });
      assert.deepEqual([stored.stock, stored.price, stored.category, stored.brand], [8, 150, "MAINBOARD", "Updated brand"]);
      assert.equal((await patch({ ...data, expectedStock: 5, stock: 9 })).status, 409);
    });

    await suite.test("pauses and resumes sales", async () => {
      for (const isActive of [false, true]) {
        const result = await patch({ isActive });
        assert.deepEqual(result, { status: 200, body: { success: true, isActive } });
        assert.equal((await db.product.findUniqueOrThrow({ where: { slug } })).isActive, isActive);
      }
    });
  } finally {
    try {
      if (fixtureStarted) {
        await db.product.deleteMany({ where: { slug: { in: [slug, slug + "-duplicate-id"] } } });
      }
    } finally {
      await db.$disconnect();
    }
  }
});
