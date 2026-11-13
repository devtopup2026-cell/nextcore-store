import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomInt, randomUUID } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { createAdminSessionToken } from "./admin-session";

test("Catalog routes authenticate and validate through Next.js", { timeout: 90000 }, async () => {
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
  const secret = randomUUID();
  const previous = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = secret;
  const token = createAdminSessionToken({
    id: randomUUID(), email: "admin@example.test", name: "Test", role: "ADMIN",
  });
  const deniedToken = createAdminSessionToken({
    id: randomUUID(), email: "guest@example.test", name: "Test", role: "CUSTOMER",
  });
  if (previous === undefined) delete process.env.ADMIN_SESSION_SECRET;
  else process.env.ADMIN_SESSION_SECRET = previous;

  const port = "4187";
  const server = spawn(process.execPath, [
    "node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "127.0.0.1", "--port", port,
  ], {
    env: { ...process.env, DATABASE_URL: url.href, ADMIN_SESSION_SECRET: secret },
    stdio: "ignore",
  });
  const closed = once(server, "close");
  const base = "http://127.0.0.1:" + port;
  const endpoint = base + "/api/admin/products";

  async function request(path: string, method: string, auth?: string, payload: object = {}) {
    return fetch(path, {
      method,
      headers: {
        "content-type": "application/json",
        ...(auth ? { cookie: "nextcore_admin_session=" + auth } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
  }

  try {
    let response: Response | undefined;
    for (let attempt = 0; attempt < 50 && server.exitCode === null; attempt++) {
      response = await request(endpoint, "POST").catch(() => undefined);
      if (response) break;
      await delay(500);
    }
    assert.equal(server.exitCode, null, "Next.js test server exited early");
    assert.ok(response, "Next.js test server did not respond");
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: "Unauthorized" });
    const forbidden = await request(endpoint, "POST", deniedToken);
    assert.equal(forbidden.status, 403);
    assert.deepEqual(await forbidden.json(), { success: false, error: "Forbidden" });
    const invalid = await request(endpoint, "POST", token);
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).success, false);
    const invalidId = await request(endpoint + "/invalid", "PATCH", token);
    assert.equal(invalidId.status, 400);
    assert.deepEqual(await invalidId.json(), { success: false, error: "Invalid product ID" });
    const taxonomy = base + "/api/catalog-taxonomy";
    const suffix = randomUUID();
    const entries: { kind: string; key: string }[] = [];
    try {
      for (const kind of ["categories", "brands"]) {
        const entry = { kind, name: "Fixture " + suffix, slug: "fixture-" + suffix, image: "", visible: false };
        assert.equal((await request(taxonomy, "POST", undefined, entry)).status, 403);
        assert.equal((await request(taxonomy, "POST", token, entry)).status, 200);
        const admin = await fetch(taxonomy + "?admin", { headers: { cookie: "nextcore_admin_session=" + token } });
        assert.equal(admin.status, 200);
        const stored = (await admin.json())[kind].find((row: { slug: string }) => row.slug === entry.slug);
        assert.ok(stored);
        entries.push({ kind, key: stored.key });
        const duplicateSlug = await request(taxonomy, "POST", token, { ...entry, name: entry.name + " other" });
        assert.equal(duplicateSlug.status, 409, kind + " duplicate slug");
        assert.deepEqual(await duplicateSlug.json(), { error: "Name or slug already exists" });
        if (kind === "brands") {
          const duplicateName = await request(taxonomy, "POST", token, {
            ...entry, name: entry.name.toUpperCase(), slug: entry.slug + "-other",
          });
          assert.equal(duplicateName.status, 409, "duplicate brand name");
          assert.deepEqual(await duplicateName.json(), { error: "Name or slug already exists" });
        }
        const publicData = await (await fetch(taxonomy)).json();
        assert.ok(!publicData[kind].some((row: { key: string }) => row.key === stored.key));
        assert.equal((await request(taxonomy, "POST", token, { ...entry, key: stored.key, visible: true })).status, 200);
        const visibleData = await (await fetch(taxonomy)).json();
        assert.ok(visibleData[kind].some((row: { key: string }) => row.key === stored.key));

        const productSlug = "race-" + kind + "-" + suffix;
        const product = {
          id: randomInt(1000000000, 2000000000), name: "Race fixture",
          slug: productSlug, price: 100, stock: 1, image: "/fixture.png",
          category: kind === "categories" ? stored.key : "CASE",
          brand: kind === "brands" ? stored.key : "Fixture",
        };
        try {
          const [save, remove] = await Promise.all([
            request(endpoint, "POST", token, product),
            request(taxonomy, "POST", token, { kind, key: stored.key, remove: true }),
          ]);
          const saved = save.status === 201;
          assert.deepEqual([save.status, remove.status], saved ? [201, 409] : [409, 200]);
          assert.equal(await db.product.count({ where: { slug: productSlug } }), saved ? 1 : 0);
          const latest = await (await fetch(taxonomy + "?admin", {
            headers: { cookie: "nextcore_admin_session=" + token },
          })).json();
          assert.equal(latest[kind].some((row: { key: string }) => row.key === stored.key), saved);
        } finally {
          await db.product.deleteMany({ where: { slug: productSlug } });
        }
      }
    } finally {
      for (const entry of entries) {
        if (entry.kind === "categories") {
          await db.$executeRaw`DELETE FROM "CatalogCategory" WHERE "key" = ${entry.key}`;
        } else {
          await db.$executeRaw`DELETE FROM "CatalogBrand" WHERE "key" = ${entry.key}`;
        }
      }
    }
  } finally {
    server.kill();
    await closed;
    await db.$disconnect();
  }
});
