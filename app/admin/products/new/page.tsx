"use client";
import ProductCategoryOptions from "@/app/components/admin/ProductCategoryOptions";
import { Text, useLanguage } from "@/app/i18n/language";


import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/admin/AdminNav";


type ProductForm = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  isActive: boolean;
  category: string;
  description: string;
  price: string;
  compareAtPrice: string;
  image: string;
  stock: string;
  featured: boolean;
  isNew: boolean;
};

export default function NewProductPage() {
  const { translate } = useLanguage();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState("");
const [uploading, setUploading] = useState(false);

function handleImageChange(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  setImageFile(file);

  const preview = URL.createObjectURL(file);
  setImagePreview(preview);
}

async function uploadProductImage() {
  if (!imageFile) {
    throw new Error("Please select a product image");
  }

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await fetch(
      "/api/admin/products/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok || data.success !== true || typeof data.url !== "string" ||
        !URL.canParse(data.url) || new URL(data.url).protocol !== "https:") {
      throw new Error(
        data.error || "Image upload failed"
      );
    }

    return data.url as string;
  } finally {
    setUploading(false);
  }
}

    const [form, setForm] = useState<ProductForm>({
   id: "",
   name: "",
   slug: "",
   brand: "",
  isActive: true,
   category: "",
   description: "",
   price: "",
   compareAtPrice: "",
   image: "",
   stock: "0",
   featured: false,
   isNew: false,
});
  const inputClass = `
    mt-2
    w-full
    rounded-xl
    border
    border-zinc-700
    bg-zinc-800
    px-4
    py-3
    text-white
    outline-none
    transition
    focus:border-red-500
  `;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((current) => ({
      ...current,
      name: value,
      slug: generatedSlug,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const productId = Number(form.id);
      const price = Number(form.price);
      const stock = Number(form.stock);

      const compareAtPrice =
  form.compareAtPrice.trim() === ""
    ? null
    : Number(form.compareAtPrice);

    if (
  compareAtPrice !== null &&
  (
    !Number.isFinite(compareAtPrice) ||
    compareAtPrice < 0
  )
) {
  throw new Error("Compare Price ไม่ถูกต้อง");
}


      if (!Number.isInteger(productId)) {
        throw new Error("Product ID ไม่ถูกต้อง");
      }

      if (!form.name.trim()) {
        throw new Error("กรุณากรอกชื่อสินค้า");
      }

      if (!form.slug.trim()) {
        throw new Error("กรุณากรอก Slug");
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("ราคาสินค้าไม่ถูกต้อง");
      }

      if (!Number.isInteger(stock) || stock < 0) {
        throw new Error("จำนวน Stock ไม่ถูกต้อง");
      }

     if (!imageFile) {
      throw new Error("กรุณาเลือกรูปสินค้า");
    }

        const imageUrl = await uploadProductImage();

        const res = await fetch("/api/admin/products", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

        body: JSON.stringify({
        id: productId,
        name: form.name.trim(),
        slug: form.slug.trim(),

        brand: form.brand.trim(),
  isActive: form.isActive,
        category: form.category,

        description:
         form.description.trim() || null,

        price,
        compareAtPrice,

        image: imageUrl,
        stock,

        featured: form.featured,
        isNew: form.isNew,
      }),
    });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to create product"
        );
      }

      alert("เพิ่มสินค้าเรียบร้อย");

      router.push("/admin/products");
      router.refresh();

    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "เพิ่มสินค้าไม่สำเร็จ"
      );

    } finally {
      setSaving(false);
    }
  };

return (
  <main className="min-h-screen bg-black text-white">

    <div className="mx-auto max-w-5xl px-6 py-16">

      <AdminNav />

      <div className="mb-10">

          <p className="font-bold text-red-500">
            <Text>{"ADMIN"}</Text>
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            <Text>{"Add Product"}</Text>
          </h1>

          <p className="mt-2 text-zinc-400">
            Create a new product for NEXTCORE.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-zinc-900 p-8"
        >

          <h2 className="mb-8 text-2xl font-bold">
            <Text>{"Product Information"}</Text>
          </h2>


          <div className="grid gap-6 md:grid-cols-2">

            {/* Product ID */}

            <label className="block">

              <span className="font-bold">
                <Text>{"Product ID"}</Text>
              </span>

              <input
                name="id"
                type="number"
                value={form.id}
                onChange={handleChange}
                placeholder="5001"
                className={inputClass}
                required
              />

            </label>


            {/* Name */}

            <label className="block">

              <span className="font-bold">
                <Text>{"Product Name"}</Text>
              </span>

              <input
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="ASUS RTX 5080"
                className={inputClass}
                required
              />

            </label>


            {/* Slug */}

            <label className="block md:col-span-2">

              <span className="font-bold">
                Slug
              </span>

              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="asus-rtx-5080"
                className={inputClass}
                required
              />

              <p className="mt-2 text-xs text-zinc-500">
                <Text>{"ระบบสร้างจากชื่อสินค้าให้อัตโนมัติ และสามารถแก้เองได้"}</Text>
              </p>

            </label>

            {/* Brand */}

            <label className="block">
              <span className="font-bold">
                <Text>{"Brand"}</Text>
              </span>

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="ASUS"
                className={inputClass}
                required
              />
            </label>


            {/* Category */}

            <label className="block">
              <span className="font-bold">
                <Text>{"Category"}</Text>
              </span>

              <select
                name="category"
                value={form.category}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    category: e.target.value,
                  }))
                }
                className={inputClass}
                required
              >
                <ProductCategoryOptions current={form.category} />
              </select>
            </label>
           

            {/* Price */}

            <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                <Text>{"Available for sale"}</Text>
              </label>

              <label className="block">

              <span className="font-bold">
                <Text>{"Price"}</Text>
              </span>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="24900"
                className={inputClass}
                required
              />

            </label>

                {/*Compare Price*/}

                <label className="block">
                  <span className="font-bold">
                    <Text>{"Compare Price"}</Text>
                  </span>

                  <input
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={handleChange}
                    placeholder="26900"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    <Text>{"ไม่ใส่ได้ หากสินค้าไม่มีราคาเดิมก่อนลด"}</Text>
                  </p>
                </label>



            {/* Stock */}

            <label className="block">

              <span className="font-bold">
                <Text>{"Stock"}</Text>
              </span>

              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                className={inputClass}
                required
              />

            </label>


            {/* Image */}

            <div>
              <label className="block mb-2 font-semibold">
                <Text>{"Product Image"}</Text>
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-zinc-700
                  bg-zinc-800
                  p-4
                  text-white
                "
              />

              <p className="mt-2 text-sm text-zinc-500">
                <Text>{"JPG, PNG or WEBP — maximum 5 MB"}</Text>
              </p>

              {imagePreview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-zinc-400">
                    <Text>{"Preview"}</Text>
                  </p>

                  <img
                    src={imagePreview}
                    alt={translate("Product preview")}
                    className="
                      h-56
                      w-56
                      rounded-xl
                      border
                      border-zinc-700
                      bg-white
                      object-contain
                      p-3
                    "
                  />
                </div>
              )}
            </div>

                {/*Featured และ New Product*/}

              <div className="flex items-center gap-6 md:col-span-2">

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            featured: e.target.checked,
                          }))
                        }
                        className="h-5 w-5"
                      />

                      <span className="font-bold">
                        <Text>{"Featured / Best Seller"}</Text>
                      </span>
                    </label>


                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.isNew}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            isNew: e.target.checked,
                          }))
                        }
                        className="h-5 w-5"
                      />

                      <span className="font-bold">
                        <Text>{"New Product"}</Text>
                      </span>
                    </label>

                  </div>



            {/* Description */}

            <label className="block md:col-span-2">

              <span className="font-bold">
                <Text>{"Description"}</Text>
              </span>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder={translate("Product description...")}
                className={inputClass}
              />

            </label>

          </div>


          {/* Error */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-400">
              {error}
            </div>
          )}


          {/* Actions */}

          <div className="mt-8 flex flex-wrap gap-4">

            <button
              type="submit"
              disabled={saving || uploading}
              className="
                rounded-xl
                bg-red-600
                px-7
                py-4
                font-bold
                transition
                hover:bg-red-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
                {uploading
                  ? <Text>{"Uploading image..."}</Text>
                  : saving
                  ? <Text>{"Creating..."}</Text>
                : <Text>{"Create Product"}</Text>}
            </button>


            <button
              type="button"
              disabled={saving}
              onClick={() =>
                router.push("/admin/products")
              }
              className="
                rounded-xl
                bg-zinc-700
                px-7
                py-4
                font-bold
                transition
                hover:bg-zinc-600
              "
            >
              <Text>{"Cancel"}</Text>
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}