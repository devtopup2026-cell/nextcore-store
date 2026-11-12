"use client";
import { Text } from "@/app/i18n/language";

import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart.store";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductInfo({ product }: Props) {

  const { addItem, clear } = useCart();
  const router = useRouter();
  return (

    <div>

      <p className="text-zinc-400 uppercase tracking-widest">
        {product.brand}
      </p>

      <h1 className="mt-2 text-6xl font-black">
        {product.name}
      </h1>

      <div className="mt-4 flex items-center gap-3">

        ⭐ {product.rating}

        <span className="text-zinc-500">
          ({product.reviewCount} <Text>{"Reviews)"}</Text>
        </span>

      </div>

      <div className="mt-8">

        <div className="flex items-center gap-4">

          <span className="text-5xl font-black text-red-500">

            ฿{product.price.toLocaleString()}

          </span>

          {product.compareAtPrice && (

            <span className="text-2xl line-through text-zinc-500">

              ฿{product.compareAtPrice.toLocaleString()}

            </span>

          )}

        </div>

      </div>

{product.stock > 0 ? (
  <p className="mt-6 text-green-400 font-bold">
    <Text>{"✔ มีสินค้า"}</Text> {product.stock} <Text>{"ชิ้น"}</Text>
  </p>
) : (
  <p className="mt-6 text-red-500 font-bold">
    <Text>{"✖ สินค้าหมด"}</Text>
  </p>
)}

      <p className="mt-6 text-zinc-400 leading-8">

        {product.description}

      </p>

      <div className="mt-10 flex gap-4">

<button
  disabled={product.stock <= 0}
  onClick={() => {
    if (product.stock <= 0) {
      return;
    }

    addItem(product);
    alert("เพิ่มสินค้าลงตะกร้าแล้ว");
  }}
  className={`flex-1 rounded-xl py-4 font-bold ${
    product.stock <= 0
      ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
      : "bg-red-600 hover:bg-red-500"
  }`}
>
  {product.stock <= 0
    ? <Text>{"Out of Stock"}</Text>
    : <Text>{"Add To Cart"}</Text>}
</button>

<button
  disabled={product.stock <= 0}
  onClick={() => {
  if (product.stock <= 0) {
    return;
  }

  clear();
  addItem(product);
  router.push("/checkout");
}}
  className={`rounded-xl border px-8 ${
    product.stock <= 0
      ? "cursor-not-allowed border-zinc-700 text-zinc-500"
      : "border-red-600 hover:bg-red-600"
  }`}
>
  <Text>{"Buy Now"}</Text>
</button>

      </div>

    </div>

  );

}