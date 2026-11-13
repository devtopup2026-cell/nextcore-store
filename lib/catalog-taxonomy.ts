import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isProductImage, isProductSlugAllowed } from "./product-input";

export const taxonomyInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().toLowerCase().max(180).refine((value) => isProductSlugAllowed(value)),
  image: z.string().trim().refine((value) => !value || isProductImage(value)),
  description: z.string().trim().max(4000).default(""),
  sortOrder: z.number().int().min(0).max(2147483647).default(0),
  visible: z.boolean(),
});

export type TaxonomyKind = "categories" | "brands";
export type TaxonomyEntry = z.output<typeof taxonomyInput> & { key: string };

export function taxonomyTable(kind: TaxonomyKind) {
  return kind === "categories" ? Prisma.sql`"CatalogCategory"` : Prisma.sql`"CatalogBrand"`;
}


export function isTaxonomyUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code === "P2002") return true;
  if (error.code !== "P2010") return false;
  if (error.meta?.code === "23505") return true;

  const adapter = error.meta?.driverAdapterError;
  if (!adapter || typeof adapter !== "object" || !("cause" in adapter)) return false;
  const cause = adapter.cause;
  return !!cause && typeof cause === "object" &&
    "originalCode" in cause && cause.originalCode === "23505";
}

export async function lockCatalogReferences(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(741025, 1)`;
}

export async function hasRemovedCatalogReference(tx: Prisma.TransactionClient, category: string, brand: string) {
  const [result] = await tx.$queryRaw<{ removed: boolean }[]>`
    SELECT EXISTS (SELECT 1 FROM "CatalogCategory" WHERE "key" = ${category} AND "retired")
        OR EXISTS (SELECT 1 FROM "CatalogBrand" WHERE lower(btrim("key")) = ${brand.trim().toLowerCase()} AND "retired") AS removed
  `;
  return result.removed;
}
