import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { normalizeProductCategory, productCategories } from "@/lib/product-categories";
import { lockCatalogReferences, isTaxonomyUniqueViolation, taxonomyInput, taxonomyTable, type TaxonomyEntry } from "@/lib/catalog-taxonomy";

export async function GET(request: Request) {
  const admin = new URL(request.url).searchParams.has("admin");
  if (admin && !await authorized()) return fail("Forbidden", 403);
  const visibility = admin ? Prisma.sql`WHERE NOT "retired"` : Prisma.sql`WHERE NOT "retired" AND "visible"`;
  const [categories, brands] = await Promise.all([
    prisma.$queryRaw<TaxonomyEntry[]>`SELECT "key","name","slug",coalesce("image", '') AS "image",coalesce("description", '') AS "description","sortOrder","visible" FROM "CatalogCategory" ${visibility} ORDER BY "sortOrder", "name", "key"`,
    prisma.$queryRaw<TaxonomyEntry[]>`SELECT "key","name","slug","image","visible" FROM "CatalogBrand" ${visibility} ORDER BY "name", "key"`,
  ]);
  return NextResponse.json({ categories, brands });
}

async function authorized() {
  const session = await getAdminSession();
  return session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
}

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  if (!await authorized()) return fail("Forbidden", 403);
  const body = await request.json().catch(() => null);
  if (body?.kind !== "categories" && body?.kind !== "brands") return fail("Invalid catalog type", 400);
  const category = body.kind === "categories";
  const table = taxonomyTable(body.kind);
  if (body.key !== undefined && (typeof body.key !== "string" || !body.key)) return fail("Invalid key", 400);

  try {

    if (body.remove === true && body.key) {
      if (category && productCategories.includes(body.key)) return fail("Built-in category cannot be deleted", 409);
      return await prisma.$transaction(async (tx) => {
        await lockCatalogReferences(tx);
        const products = await tx.product.findMany({ select: { category: true, brand: true } });
        const inUse = products.some((product) => category
          ? normalizeProductCategory(product.category) === body.key
          : product.brand.trim().toLowerCase() === body.key.trim().toLowerCase());
        if (inUse) return fail("This entry is used by products", 409);
        const removed = await tx.$executeRaw`UPDATE ${table} SET "retired" = true, "visible" = false WHERE "key" = ${body.key} AND NOT "retired"`;
        return removed ? NextResponse.json({ success: true }) : fail("Entry not found", 404);
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
    }

    const parsed = taxonomyInput.safeParse(body);
    if (!parsed.success) return fail("Check name, slug, image and sort order", 400);
    const { name, slug, image, description, visible, sortOrder } = parsed.data;
    const key = body.key ?? "catalog-" + randomUUID();
    if (!body.key && category && normalizeProductCategory(name) === "All") return fail("Reserved category", 400);
    const fields = category
      ? Prisma.sql`"description" = ${description || null}, "sortOrder" = ${sortOrder}`
      : Prisma.sql`"nameKey" = ${name.toLowerCase()}`;

    const changed = body.key
      ? await prisma.$executeRaw`UPDATE ${table} SET "name"=${name},"slug"=${slug},"image"=${image || null},"visible"=${visible},${fields} WHERE "key"=${key} AND NOT "retired"`
      : category
        ? await prisma.$executeRaw`INSERT INTO "CatalogCategory" ("key","name","slug","image","description","sortOrder","visible") VALUES (${key},${name},${slug},${image || null},${description || null},${sortOrder},${visible})`
        : await prisma.$executeRaw`INSERT INTO "CatalogBrand" ("key","name","nameKey","slug","image","visible") VALUES (${key},${name},${name.toLowerCase()},${slug},${image || null},${visible})`;
    return changed ? NextResponse.json({ success: true }) : fail("Entry not found", 404);
  } catch (error) {
    if (isTaxonomyUniqueViolation(error)) return fail("Name or slug already exists", 409);
    return fail("Could not save catalog entry", 500);
  }
}
