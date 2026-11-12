"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import AdminNav from "@/app/components/admin/AdminNav";

type ProductForm = {
  name: string;
  slug: string;

  brand: string;
  category: string;

  description: string;

  price: string;
  compareAtPrice: string;

  image: string;
  stock: string;

  featured: boolean;
  isNew: boolean;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [productName, setProductName] = useState("");
  const [error, setError] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

const [form, setForm] = useState<ProductForm>({
  name: "",
  slug: "",

  brand: "",
  category: "",

  description: "",

  price: "",
  compareAtPrice: "",

  image: "",
  stock: "",

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

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/admin/products/${productId}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load product"
          );
        }

setForm({
  name: data.product.name,
  slug: data.product.slug,

  brand: data.product.brand || "",
  category: data.product.category || "",

  description:
    data.product.description || "",

  price: String(data.product.price),

  compareAtPrice:
    data.product.compareAtPrice != null
      ? String(data.product.compareAtPrice)
      : "",

  image: data.product.image,
  stock: String(data.product.stock),

  featured: Boolean(data.product.featured),
  isNew: Boolean(data.product.isNew),
});

setProductName(data.product.name);
setImagePreview(data.product.image);

      } catch (error) {
        console.error(
          "LOAD PRODUCT ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load product"
        );

      } finally {
        setLoading(false);
      }
    };

    loadProduct();

  }, [productId]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    
  };

  const handleImageChange = (
  e: ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setImageFile(file);

  const previewUrl = URL.createObjectURL(file);
  setImagePreview(previewUrl);
};

const uploadProductImage = async () => {
  if (!imageFile) {
    return form.image;
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

    if (!res.ok || !data.success) {
      throw new Error(
        data.error || "Image upload failed"
      );
    }

    return data.url as string;
  } finally {
    setUploading(false);
  }
};


  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

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

      if (!form.name.trim()) {
        throw new Error("กรุณากรอกชื่อสินค้า");
      }

      if (!form.slug.trim()) {
        throw new Error("กรุณากรอก Slug");
      }

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error("ราคาสินค้าไม่ถูกต้อง");
      }

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error("จำนวน Stock ไม่ถูกต้อง");
      }

      if (!form.image.trim()) {
        throw new Error("กรุณาระบุรูปสินค้า");
      }

      const imageUrl = await uploadProductImage();

      const res = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

body: JSON.stringify({
  name: form.name.trim(),
  slug: form.slug.trim(),

  brand: form.brand.trim(),
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
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update product"
        );
      }

      alert("แก้ไขสินค้าเรียบร้อย");

      router.push("/admin/products");
      router.refresh();

    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "แก้ไขสินค้าไม่สำเร็จ"
      );

    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productName || saving || uploading || deleting) return;

    if (!window.confirm(`ลบสินค้า "${productName}" ถาวรใช่หรือไม่?`)) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "ไม่สามารถลบสินค้าได้");
      }

      router.replace("/admin/products");
    } catch (error) {
      setError(error instanceof Error ? error.message : "ไม่สามารถลบสินค้าได้");
      setDeleting(false);
    }
  };

return (
  <main className="min-h-screen bg-black text-white">

    <div className="mx-auto max-w-5xl px-6 py-16">

      <AdminNav />

      <p className="font-bold text-red-500">
        ADMIN
      </p>

        <h1 className="mt-2 text-4xl font-bold">
          Edit Product
        </h1>

        <p className="mt-2 text-zinc-400">
          Product ID: {productId}
        </p>


        {loading ? (

          <div className="mt-10 rounded-3xl bg-zinc-900 p-8 text-zinc-400">
            Loading product...
          </div>

        ) : error && !form.name ? (

          <div className="mt-10 rounded-3xl bg-zinc-900 p-8 text-red-400">
            {error}
          </div>

        ) : (

          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-3xl bg-zinc-900 p-8"
          >

            <h2 className="mb-8 text-2xl font-bold">
              Product Information
            </h2>


            <div className="grid gap-6 md:grid-cols-2">

              <label className="block">

                <span className="font-bold">
                  Product Name
                </span>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

              </label>


              <label className="block">

                <span className="font-bold">
                  Slug
                </span>

                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

              </label>


              <label className="block">
  <span className="font-bold">
    Brand
  </span>

  <input
    name="brand"
    value={form.brand}
    onChange={handleChange}
    className={inputClass}
    required
  />
</label>


<label className="block">
  <span className="font-bold">
    Category
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
    <option value="">
      Select Category
    </option>

    <option value="CPU">CPU</option>
    <option value="VGA">VGA</option>
    <option value="RAM">RAM</option>
    <option value="SSD">SSD</option>
    <option value="HDD">HDD</option>
    <option value="PSU">PSU</option>
    <option value="Monitor">Monitor</option>
    <option value="Keyboard">Keyboard</option>
    <option value="Mouse">Mouse</option>
    <option value="Gaming Gear">
      Gaming Gear
    </option>
    <option value="PC Set">PC Set</option>
  </select>
</label>


              <label className="block">

                <span className="font-bold">
                  Price
                </span>

                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

              </label>


              <label className="block">
  <span className="font-bold">
    Compare Price
  </span>

  <input
    name="compareAtPrice"
    type="number"
    min="0"
    step="0.01"
    value={form.compareAtPrice}
    onChange={handleChange}
    className={inputClass}
    placeholder="26900"
  />
</label>


              <label className="block">

                <span className="font-bold">
                  Stock
                </span>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

              </label>


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
      Featured / Best Seller
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
      New Product
    </span>
  </label>

</div>


              <div className="md:col-span-2">

                <span className="font-bold">
                  Product Image
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="
                    mt-2
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
                  JPG, PNG or WEBP — maximum 5 MB
                </p>

                {imagePreview && (
                  <div className="mt-4">

                    <p className="mb-2 text-sm text-zinc-400">
                      Current / New Image Preview
                    </p>

                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="
                        h-64
                        w-64
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


              <label className="block md:col-span-2">

                <span className="font-bold">
                  Description
                </span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  className={inputClass}
                />

              </label>

            </div>


            {error && (
              <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-400">
                {error}
              </div>
            )}


            <div className="mt-8 flex flex-wrap gap-4">

              <button
                type="submit"
                disabled={saving || uploading || deleting}
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
                    ? "Uploading image..."
                    : saving
                    ? "Saving..."
                    : "Save Changes"}
              </button>


              <button
                type="button"
                disabled={saving || deleting}
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
                Cancel
              </button>

              <button
                type="button"
                disabled={!productName || saving || uploading || deleting}
                onClick={handleDelete}
                className="rounded-xl border border-red-700 px-7 py-4 font-bold text-red-400 hover:bg-red-950 disabled:opacity-50"
              >
                {deleting ? "กำลังลบ…" : "ลบสินค้า"}
              </button>

            </div>

          </form>

        )}

      </div>

    </main>
  );
}