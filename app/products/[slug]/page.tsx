import { notFound } from "next/navigation";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/Footer";
import ProductGallery from "@/app/components/product/ProductGallery";
import ProductInfo from "@/app/components/product/ProductInfo";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: Props) {
  const { slug } = await params;

  const dbProduct =
    await prisma.product.findUnique({
      where: {
        slug,
      },
    });

  if (!dbProduct) {
    notFound();
  }

const product: Product = {
  id: dbProduct.id,
  slug: dbProduct.slug,
  name: dbProduct.name,

  brand: dbProduct.brand,
  category: dbProduct.category,

  shortDescription:
    dbProduct.shortDescription ?? undefined,

  description:
    dbProduct.description ?? undefined,

  image: dbProduct.image,

  thumbnail:
    dbProduct.thumbnail ?? dbProduct.image,

  images:
    dbProduct.images.length > 0
      ? dbProduct.images
      : [dbProduct.image],

  price: dbProduct.price,

  compareAtPrice:
    dbProduct.compareAtPrice ?? undefined,

  stock: dbProduct.stock,

  rating: dbProduct.rating,
  reviewCount: dbProduct.reviewCount,

  featured: dbProduct.featured,
  isNew: dbProduct.isNew,

  specifications:
    Array.isArray(dbProduct.specifications)
      ? (
          dbProduct.specifications as {
            label: string;
            value: string;
          }[]
        )
      : [],

  warranty:
    dbProduct.warranty ?? undefined,

  sku:
    dbProduct.sku ?? undefined,
};

  return (
  <>
    <Header />

    <main className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid lg:grid-cols-2 gap-16">

          <ProductGallery
            images={product.images ?? [product.image]}
          />

          <ProductInfo
            product={product}
          />

        </div>

      </div>
    </main>

    <Footer />
  </>
);
}