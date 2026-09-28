"use client";

import { useEffect, useState } from "react";

import ProductCard from "./product/ProductCard";
import type { Product } from "@/types/product";

export default function BestSeller() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.error || "Failed to load products"
          );
        }

        const featuredProducts = data.products.filter(
          (product: Product) => product.featured
        );

        setProducts(featuredProducts);
      } catch (error) {
        console.error(
          "LOAD BEST SELLER ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดสินค้า Best Seller ได้"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="bg-zinc-950 py-24">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-5xl font-bold text-center mb-16">
          Best Seller
        </h2>

        {loading && (
          <p className="text-center text-zinc-400">
            Loading products...
          </p>
        )}

        {error && (
          <p className="text-center text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-zinc-500">
            No Best Seller products.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid gap-8 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}