"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart.store";

export default function BuildPCPage() {

const [products, setProducts] = useState<any[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [selectedParts, setSelectedParts] = useState<Record<string, any>>({});

const [ramQuantity, setRamQuantity] = useState(1);
const [ssdQuantity, setSsdQuantity] = useState(1);
const [hddQuantity, setHddQuantity] = useState(1);

const addItem = useCart((state) => state.addItem);


useEffect(() => {
  async function loadProducts() {
    try {
      const res = await fetch("/api/products");

      if (!res.ok) {
        throw new Error("Failed to load products");
      }

      const data = await res.json();

        setProducts(Array.isArray(data) ? data : data.products ?? []);
    } catch (error) {
      console.error("Build PC products error:", error);
    }
  }

  loadProducts();
}, []);


const selectedProducts = Object.values(selectedParts).filter(
  (product) => Boolean(product)
);

const selectedCount = selectedProducts.length;

const totalPrice = selectedProducts.reduce((sum, product) => {
  const price = Number(product.price);

if (product.category?.toUpperCase() === "RAM") {
  return sum + price * ramQuantity;
}

if (product.category?.toUpperCase() === "SSD") {
  return sum + price * ssdQuantity;
}

if (product.category?.toUpperCase() === "HDD") {
  return sum + price * hddQuantity;
}

return sum + price;
}, 0);


const handleRemovePart = (category: string) => {
  setSelectedParts((prev) => {
    const next = { ...prev };
    delete next[category];
    return next;
  });

  if (category === "RAM") {
    setRamQuantity(1);
  }

  if (category === "SSD") {
    setSsdQuantity(1);
  }

  if (category === "HDD") {
    setHddQuantity(1);
  }
};


const handleClearBuild = () => {
  setSelectedParts({});
  setSelectedCategory(null);

  setRamQuantity(1);
  setSsdQuantity(1);
  setHddQuantity(1);
};

const handleAddBuildToCart = () => {
  if (selectedProducts.length === 0) {
    alert("กรุณาเลือกอุปกรณ์อย่างน้อย 1 ชิ้น");
    return;
  }

  selectedProducts.forEach((product) => {
  const category = product.category?.toUpperCase();

  let quantity = 1;

  if (category === "RAM") {
    quantity = ramQuantity;
  }

  if (category === "SSD") {
    quantity = ssdQuantity;
  }

  if (category === "HDD") {
    quantity = hddQuantity;
  }

  for (let i = 0; i < quantity; i++) {
    addItem(product);
  }
});


const totalItems = selectedProducts.reduce((count, product) => {
  const productCategory = product.category?.toUpperCase();

  const quantity =
    productCategory === "RAM"
      ? ramQuantity
      : productCategory === "SSD"
        ? ssdQuantity
        : productCategory === "HDD"
          ? hddQuantity
          : 1;

  return count + quantity;
}, 0);


  alert(
  `เพิ่มอุปกรณ์ ${selectedCount} รายการ รวม ${totalItems} ชิ้นลงตะกร้าแล้ว`
);
};


  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-500">
            NEXTCORE PC BUILDER
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Build Your PC
          </h1>

          <p className="mt-4 text-zinc-400">
            เลือกอุปกรณ์สำหรับประกอบคอมพิวเตอร์ในแบบที่คุณต้องการ
          </p>
        </div>

<div className="grid gap-8 lg:grid-cols-[1fr_360px]">
  {/* COMPONENTS */}
  <div className="space-y-4">
    {[
      ["CPU", "Processor"],
      ["MAINBOARD", "Motherboard"],
      ["RAM", "Memory"],
      ["VGA", "Graphics Card"],
      ["SSD", "SSD Storage"],
      ["HDD", "HDD Storage"],
      ["PSU", "Power Supply"],
      ["CASE", "Computer Case"],
      ["COOLER", "CPU Cooler"],
    ].map(([category, label]) => (
      <div
        key={category}
        className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
      >
        <div>
          <p className="text-sm font-semibold text-red-500">
            {category}
          </p>

          <h2 className="mt-1 text-lg font-bold">
            {label}
          </h2>

          {selectedParts[category] ? (
  <div className="mt-2">
    <p className="font-semibold text-white">
      {selectedParts[category].name}
    </p>

    <p className="mt-1 font-bold text-red-500">
      ฿{Number(selectedParts[category].price).toLocaleString()}
    </p>

    {category === "RAM" && (
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setRamQuantity((qty) => Math.max(1, qty - 1))
          }
          disabled={ramQuantity <= 1}
          className="h-9 w-9 rounded-lg bg-zinc-800 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          -
        </button>

        <span className="min-w-8 text-center font-bold">
          {ramQuantity}
        </span>

        <button
          type="button"
          onClick={() =>
            setRamQuantity((qty) =>
              Math.min(
                selectedParts[category]?.stock ?? 1,
                qty + 1
              )
            )
          }
          disabled={
            ramQuantity >=
            (selectedParts[category]?.stock ?? 1)
          }
          className="h-9 w-9 rounded-lg bg-zinc-800 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>

        <span className="text-sm text-zinc-500">
          Stock: {selectedParts[category]?.stock ?? 0}
        </span>
      </div>
    )}

    {category === "SSD" && (
  <div className="mt-3 flex items-center gap-3">
    <button
      type="button"
      onClick={() =>
        setSsdQuantity((qty) => Math.max(1, qty - 1))
      }
      disabled={ssdQuantity <= 1}
      className="h-9 w-9 rounded-lg bg-zinc-800 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      -
    </button>

    <span className="min-w-8 text-center font-bold">
      {ssdQuantity}
    </span>

    <button
      type="button"
      onClick={() =>
        setSsdQuantity((qty) =>
          Math.min(
            selectedParts[category]?.stock ?? 1,
            qty + 1
          )
        )
      }
      disabled={
        ssdQuantity >=
        (selectedParts[category]?.stock ?? 1)
      }
      className="h-9 w-9 rounded-lg bg-zinc-800 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      +
    </button>

    <span className="text-sm text-zinc-500">
      Stock: {selectedParts[category]?.stock ?? 0}
    </span>

  </div>
)}

{category === "HDD" && (
  <div className="mt-3 flex items-center gap-3">
    <button
      type="button"
      onClick={() =>
        setHddQuantity((qty) => Math.max(1, qty - 1))
      }
      disabled={hddQuantity <= 1}
      className="h-9 w-9 rounded-lg bg-zinc-800 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      -
    </button>

    <span className="min-w-8 text-center font-bold">
      {hddQuantity}
    </span>

    <button
      type="button"
      onClick={() =>
        setHddQuantity((qty) =>
          Math.min(
            selectedParts[category]?.stock ?? 1,
            qty + 1
          )
        )
      }
      disabled={
        hddQuantity >=
        (selectedParts[category]?.stock ?? 1)
      }
      className="h-9 w-9 rounded-lg bg-zinc-800 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      +
    </button>

    <span className="text-sm text-zinc-500">
      Stock: {selectedParts[category]?.stock ?? 0}
    </span>
  </div>
)}

  </div>
) : (
            <p className="mt-1 text-sm text-zinc-500">
              ยังไม่ได้เลือกสินค้า
            </p>
          )}
        </div>

        <div className="flex gap-2">
  {selectedParts[category] ? (
    <>
      <button
        type="button"
        onClick={() => setSelectedCategory(category)}
        className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
      >
        Change
      </button>

      <button
        type="button"
        onClick={() => handleRemovePart(category)}
        className="rounded-xl border border-red-600 px-5 py-3 font-bold text-red-500 transition hover:bg-red-600 hover:text-white"
      >
        Remove
      </button>
    </>
  ) : (
    <button
      type="button"
      onClick={() => setSelectedCategory(category)}
      className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
    >
      Select
    </button>
  )}
</div>
      </div>
    ))}
  </div>

  {/* SUMMARY */}
  <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 lg:sticky lg:top-6">
    <h2 className="text-2xl font-bold">
      Build Summary
    </h2>

    <div className="my-6 border-t border-zinc-800" />

    <div className="flex items-center justify-between">
      <span className="text-zinc-400">Selected Parts</span>
      <span className="font-semibold">{selectedCount}</span>
    </div>

    <div className="mt-4 flex items-end justify-between">
      <span className="text-zinc-400">Total</span>

      <span className="text-3xl font-bold text-red-500">
        ฿{totalPrice.toLocaleString()}
      </span>
    </div>

    <button
      type="button"
      onClick={handleAddBuildToCart}
      disabled={selectedCount === 0}
      className="mt-6 w-full rounded-xl bg-red-600 py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
    >
      Add Build To Cart
    </button>

    <button
  type="button"
  onClick={handleClearBuild}
  disabled={selectedCount === 0}
  className="mt-3 w-full rounded-xl border border-red-600 py-3 font-bold text-red-500 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600 disabled:hover:bg-transparent"
>
  Clear Build
</button>

    <p className="mt-3 text-center text-xs text-zinc-500">
      เลือกอุปกรณ์เพื่อเริ่มจัดสเปค
    </p>
  </aside>
</div>
      </div>

        {selectedCategory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
    <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-red-500">
            {selectedCategory}
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Select Product
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {products
          .filter(
            (product) =>
              product.category?.toUpperCase() ===
              selectedCategory.toUpperCase()
          )
          .map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div>
                <h3 className="font-bold">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
                  {product.brand}
                </p>

                <p className="mt-2 font-bold text-red-500">
                  ฿{Number(product.price).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedParts((prev) => ({
                    ...prev,
                    [selectedCategory]: product,
                  }));

                  if (selectedCategory === "RAM") {
                    setRamQuantity(1);
                  }

                  if (selectedCategory === "SSD") {
                    setSsdQuantity(1);
                  }

                  if (selectedCategory === "HDD") {
                    setHddQuantity(1);
                  }

                  setSelectedCategory(null);
                }}
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
            >
                Choose
                </button>
            </div>
          ))}
      </div>

    </div>
  </div>
)}

    </main>
  );
}