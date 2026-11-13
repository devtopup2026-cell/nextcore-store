import { z } from "zod";
import { normalizeProductCategory, productCategories } from "./product-categories";

const text = z.string().trim().min(1);
const number = z.union([z.number(), text]).pipe(z.coerce.number<string | number>().finite().nonnegative());
const intMax = 2147483647;
export const productIdSchema = number.pipe(z.number().int().positive().max(intMax));

export const saleStatusSchema = z.boolean().optional();
export const productStockSchema = number.pipe(z.number().int().max(intMax));

export const productInput = z.object({
  name: text,
  slug: text,

  brand: text,
  category: text.transform(normalizeProductCategory).refine((value) => value !== "All"),
  price: number,
  compareAtPrice: z.union([number, z.literal(""), z.null()]).optional().transform((value) => value === "" ? null : value ?? null),
  stock: productStockSchema,
  image: text.refine(isProductImage, "Invalid product image"),
  description: z.string().trim().nullish().transform((value) => value || null),
  isActive: saleStatusSchema,
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
});

export function isProductImage(value: string) {
  if (/^\/(?![\/\\])[^\\\s]+$/.test(value)) return true;
  return URL.canParse(value) && new URL(value).protocol === "https:";
}

export function isProductCategoryAllowed(category: string, previous?: string) {
  return productCategories.includes(category) ||
    (previous !== undefined && normalizeProductCategory(previous) === category);
}

export function isProductSlugAllowed(slug: string, previous?: string) {
  return slug === previous || /^[\p{L}\p{N}\p{M}]+(?:-[\p{L}\p{N}\p{M}]+)*$/u.test(slug);
}
