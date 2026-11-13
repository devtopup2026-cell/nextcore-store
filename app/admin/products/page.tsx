"use client";
import { normalizeProductCategory, productCategoryLabel } from "@/lib/product-categories";
import { Text, useLanguage } from "@/app/i18n/language";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/admin/AdminNav";

type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  slug: string;
  description?: string | null;
  price: number;
  image: string;
  stock: number;
  isActive: boolean;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { translate } = useLanguage();
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/admin/products", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load products"
          );
        }

        setProducts(data.products);
      } catch (error) {
        console.error("LOAD PRODUCTS ERROR:", error);
        setError("ไม่สามารถโหลดสินค้าได้");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  
  
  const toggleProduct = async (product: Product) => {
    setUpdatingId(product.id);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เปลี่ยนสถานะสินค้าไม่สำเร็จ");
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, isActive: data.isActive } : item
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "เปลี่ยนสถานะสินค้าไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].sort();
  const categories = [...new Set(products.map((product) => normalizeProductCategory(product.category)).filter(Boolean))].sort();
  const visibleProducts = products.filter((product) =>
    (!brand || product.brand === brand) &&
    (!category || normalizeProductCategory(product.category) === category) &&
    (!status || product.isActive === (status === "active"))
  );

  return (
<main className="min-h-screen bg-black text-white">
  <div className="mx-auto max-w-7xl px-6 py-16">

    <AdminNav />

      <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="font-bold text-red-500">
              <Text>{"ADMIN"}</Text>
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              <Text>{"Product Management"}</Text>
            </h1>

            <p className="mt-2 text-zinc-400">
              <Text>{"Manage products, prices and stock."}</Text>
            </p>
          </div>


        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              <Text>{"Products"}</Text>
            </h2>

            <button
              type="button"
              onClick={() => router.push("/admin/products/new")}
              className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500"
            >
              <Text>{"+ Add Product"}</Text>
            </button>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <select aria-label={translate("Brand")} value={brand} onChange={(event) => setBrand(event.target.value)} className="rounded-lg bg-zinc-800 p-3">
              <option value="">{translate("All brands")}</option>
              {brands.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select aria-label={translate("Category")} value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg bg-zinc-800 p-3">
              <option value="">{translate("All categories")}</option>
              {categories.map((item) => <option key={item} value={item}>{translate(productCategoryLabel(item))}</option>)}
            </select>
            <select aria-label={translate("Status")} value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg bg-zinc-800 p-3">
              <option value="">{translate("All statuses")}</option>
              <option value="active">{translate("Available for sale")}</option>
              <option value="paused">{translate("Sale paused")}</option>
            </select>
          </div>

          {loading && (
            <div className="py-12 text-center text-zinc-400">
              <Text>{"Loading products..."}</Text>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-400">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            visibleProducts.length === 0 && (
              <div className="py-12 text-center text-zinc-500">
                <Text>{"No products found."}</Text>
              </div>
            )}

          {!loading &&
            !error &&
            visibleProducts.length > 0 && (
              <div className="space-y-4">
                {visibleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-800 p-5"
                  >
            <div className="flex items-center gap-4">

              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                    <Text>{"No Image"}</Text>
                  </div>
                )}
              </div>

              <div>
                <p className="text-lg font-bold">
                  {product.name}
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  ID: {product.id}
                  {" ? "}{product.brand}{" ? "}<Text>{productCategoryLabel(product.category)}</Text>
                </p>
                <p className={product.isActive ? "text-green-400" : "text-amber-400"}>
                  <Text>{product.isActive ? "Available for sale" : "Sale paused"}</Text>
                </p>
              </div>

            </div>

                    <div className="flex items-center gap-10">
                      <div>
                        <p className="text-xs text-zinc-500">
                          <Text>{"Price"}</Text>
                        </p>

                        <p className="font-bold">
                          ฿{product.price.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          <Text>{"Stock"}</Text>
                        </p>

                        <p
                          className={
                            product.stock <= 5
                              ? "font-bold text-red-500"
                              : "font-bold text-green-500"
                          }
                        >
                          {product.stock}
                        </p>
                      </div>

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          router.push(
                            `/admin/products/${product.id}`
                          )
                        }
                        className="
                          rounded-lg
                          bg-zinc-700
                          px-4
                          py-2
                          font-bold
                          transition
                          hover:bg-zinc-600
                        "
                      >
                        <Text>{"Edit"}</Text>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleProduct(product)}
                        disabled={updatingId !== null}
                        className="rounded-lg bg-zinc-700 px-4 py-2 font-bold hover:bg-zinc-600 disabled:opacity-50"
                      >
                        {updatingId === product.id
                          ? <Text>{"กำลังบันทึก…"}</Text>
                          : product.isActive ? <Text>{"ปิดขาย"}</Text> : <Text>{"เปิดขาย"}</Text>}
                      </button>

                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

        </div>
      </div>
    </main>
  );
}