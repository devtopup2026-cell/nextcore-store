import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "@prisma/client";
import { isTaxonomyUniqueViolation, taxonomyInput } from "./catalog-taxonomy";

test("taxonomy normalizes names and slugs and preserves hidden entries", () => {
  const parsed = taxonomyInput.parse({ name: "  Example ", slug: " EXAMPLE ", image: "", visible: false });
  assert.equal(parsed.name, "Example");
  assert.equal(parsed.slug, "example");
  assert.equal(parsed.visible, false);
  assert.equal(parsed.sortOrder, 0);
});

test("taxonomy rejects malformed slugs, invalid ordering and unsafe image schemes", () => {
  const valid = { name: "Example", slug: "example", image: "", visible: true };
  for (const patch of [{ slug: "a/b" }, { sortOrder: -1 }, { image: "javascript:alert(1)" }, { name: " " }]) {
    assert.equal(taxonomyInput.safeParse({ ...valid, ...patch }).success, false);
  }
});

test("classifies only confirmed unique constraint errors", () => {
  const error = (code: string, meta?: Record<string, unknown>) =>
    new Prisma.PrismaClientKnownRequestError("fixture", { code, clientVersion: "test", meta });
  assert.equal(isTaxonomyUniqueViolation(error("P2002")), true);
  assert.equal(isTaxonomyUniqueViolation(error("P2010", { code: "23505" })), true);
  assert.equal(isTaxonomyUniqueViolation(error("P2010", {
    driverAdapterError: { cause: { originalCode: "23505" } },
  })), true);
  assert.equal(isTaxonomyUniqueViolation(error("P2010", {
    driverAdapterError: { cause: { originalCode: "23503" } },
  })), false);
  assert.equal(isTaxonomyUniqueViolation(error("P2010")), false);
  assert.equal(isTaxonomyUniqueViolation(error("P2025", { code: "23505" })), false);
  assert.equal(isTaxonomyUniqueViolation(new Error("23505")), false);
});
