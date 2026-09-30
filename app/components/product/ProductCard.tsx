"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { useCart } from "@/store/cart.store";



type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  return (
    
    <Link href={`/products/${product.slug}`}>
      <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-2 hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/20">

        <div className="relative aspect-square overflow-hidden bg-black">

          <Image
            src={product.thumbnail ?? product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
          />

          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
              NEW
            </span>
          )}

        </div>

        <div className="p-4 sm:p-5">

          <p className="text-sm text-zinc-400">
            {product.brand}
          </p>

          <h3 className="mt-1 line-clamp-2 text-lg font-bold sm:text-xl">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-2">

            <span className="text-yellow-400">
              ⭐
            </span>

            <span className="text-sm">
              {product.rating}
            </span>

            <span className="text-zinc-500">
              ({product.reviewCount ?? 0})
            </span>

          </div>

          <p className="mt-4 text-2xl font-black text-red-500 sm:mt-5 sm:text-3xl">
            ฿{product.price.toLocaleString()}
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            เหลือ {product.stock} ชิ้น
          </p>

        <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product);
  }}
  className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-500"
>
  Add To Cart
</button>

        </div>

      </div>
    </Link>
  );
}