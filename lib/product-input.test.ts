import assert from "node:assert/strict";
import { test } from "node:test";
import { isProductCategoryAllowed, isProductSlugAllowed, productIdSchema, productInput } from "./product-input";

const product = {
  name: " Test product ", slug: " เคส-01 ", brand: " Brand ",
  category: " Computer Case ", price: "99.50", stock: "0",
  image: "/products/test.webp", isActive: false,
};

test("normalizes catalog fields and preserves zero stock and paused sales", () => {
  const result = productInput.parse(product);
  assert.equal(result.name, "Test product");
  assert.equal(result.slug, "เคส-01");
  assert.equal(result.brand, "Brand");
  assert.equal(result.category, "CASE");
  assert.equal(result.price, 99.5);
  assert.equal(result.stock, 0);
  assert.equal(result.isActive, false);
  assert.equal(isProductSlugAllowed(result.slug), true);
});

test("rejects invalid required values, numbers, image URLs and status", () => {
  for (const invalid of [
    { name: " " }, { brand: null }, { category: "All" }, { price: "" },
    { price: true }, { price: -1 }, { stock: 1.5 }, { stock: 2147483648 },
    { image: "//example.test/a" }, { image: "http://example.test/a" }, { isActive: "false" },
  ]) assert.equal(productInput.safeParse({ ...product, ...invalid }).success, false);
  for (const id of [null, false, "", 0, -1, 1.5, 2147483648]) {
    assert.equal(productIdSchema.safeParse(id).success, false);
  }
  assert.equal(productIdSchema.parse("5001"), 5001);
});

test("preserves existing legacy category and slug while rejecting new invalid ones", () => {
  assert.equal(isProductCategoryAllowed("CASE"), true);
  assert.equal(isProductCategoryAllowed("Legacy"), false);
  assert.equal(isProductCategoryAllowed("Legacy", " Legacy "), true);
  assert.equal(isProductSlugAllowed("old_slug"), false);
  assert.equal(isProductSlugAllowed("old_slug", "old_slug"), true);
  assert.equal(isProductSlugAllowed("nested/path"), false);
});
