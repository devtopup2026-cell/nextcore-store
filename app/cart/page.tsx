"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/store/cart.store";


export default function CartPage() {
  const {
    items,
    increase,
    decrease,
    removeItem,
    totalPrice,
    clear,
  } = useCart();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">

        <div className="mx-auto max-w-7xl px-6 py-16">

          <h1 className="mb-10 text-5xl font-black">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

              <h2 className="text-3xl font-bold">
                ตะกร้าสินค้าว่าง
              </h2>

              <p className="mt-4 text-zinc-400">
                ยังไม่มีสินค้าในตะกร้า
              </p>

              <Link
                href="/products"
                className="mt-8 inline-block rounded-xl bg-red-600 px-8 py-4 font-bold hover:bg-red-500"
              >
                เลือกซื้อสินค้า
              </Link>

            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-3">

              {/* รายการสินค้า */}
              <div className="lg:col-span-2 space-y-6">

                {items.map((item) => (

                  <div
                    key={item.product.id}
                    className="flex gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                  >

                    <div className="relative h-32 w-32 overflow-hidden rounded-xl">

                      <Image
                        src={item.product.thumbnail ?? item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />

                    </div>

                    <div className="flex-1">

                      <h2 className="text-2xl font-bold">
                        {item.product.name}
                      </h2>

                      <p className="mt-2 text-zinc-400">
                        {item.product.brand}
                      </p>

                      <p className="mt-4 text-2xl font-black text-red-500">
                        ฿{item.product.price.toLocaleString()}
                      </p>

                      <div className="mt-6 flex items-center gap-3">

                        <button
                            disabled={item.quantity === 1}
                            onClick={() => decrease(item.product.id)}
                          className="h-10 w-10 rounded-lg bg-zinc-800"
                        >
                          -
                        </button>

                        <span className="text-xl font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increase(item.product.id)}
                          className="h-10 w-10 rounded-lg bg-zinc-800"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeItem(item.product.id)}
                              className="
                              rounded-lg
                              border
                              border-red-600
                              px-4
                              py-2
                              text-red-500
                              hover:bg-red-600
                              hover:text-white
                              transition
                              "
                        >
                          Remove
                        </button>

                      </div>

                      <p className="mt-3 text-zinc-400">
  รวม&nbsp;
  <span className="font-bold text-white">
    ฿{(item.product.price * item.quantity).toLocaleString()}
  </span>
</p>
                    </div>

                  </div>

                ))}

              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 h-fit">

                <h2 className="text-3xl font-bold">
                  Summary
                </h2>

                <div className="mt-8 flex justify-between">

                  <span>Total</span>

                  <span className="text-3xl font-black text-red-500">
                    ฿{totalPrice().toLocaleString()}
                  </span>

                </div>

                <Link
                   href="/checkout"
                   className="
                   mt-10
                   flex
                   w-full
                   items-center
                   justify-center
                   rounded-xl
                   bg-red-600
                   py-4
                   font-bold
                   hover:bg-red-500
                   "
                   >
                       Checkout
                </Link>                
                

                <button
                  onClick={clear}
                  className="mt-4 w-full rounded-xl border border-red-600 py-4 hover:bg-red-600"
                >
                  Clear Cart
                </button>

              </div>

            </div>
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}