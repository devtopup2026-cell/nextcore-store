import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
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

  async function request(path: string, method: string, auth?: string) {
    return fetch(path, {
      method,
      headers: {
        "content-type": "application/json",
        ...(auth ? { cookie: "nextcore_admin_session=" + auth } : {}),
      },
      body: "{}",
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
  } finally {
    server.kill();
    await closed;
  }
});
