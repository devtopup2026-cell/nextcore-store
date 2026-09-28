"use client";

import AdminNav from "@/app/components/admin/AdminNav";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Order = {
  id: string;

  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
  };

  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingPostalCode: string;

  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;

  items: {
    id: string;
    quantity: number;
    price: number;

    product: {
      id: number;
      name: string;
      image: string;
    };
  }[];
};

type EditForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  total: string;
  date: string;
  time: string;
};

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<EditForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    total: "",
    date: "",
    time: "",
  });

  // ======================================================
  // Load Order
  // ======================================================

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/order/${encodeURIComponent(orderId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load order"
          );
        }

        const loadedOrder: Order = data.order;

        setOrder(loadedOrder);

        const created = new Date(loadedOrder.createdAt);

        const year = created.getFullYear();
        const month = String(
          created.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          created.getDate()
        ).padStart(2, "0");

        const hours = String(
          created.getHours()
        ).padStart(2, "0");

        const minutes = String(
          created.getMinutes()
        ).padStart(2, "0");

        setForm({
          fullName: loadedOrder.recipientName,
          email: loadedOrder.recipientEmail,
          phone: loadedOrder.recipientPhone,
          address: loadedOrder.shippingAddress,
          postalCode: loadedOrder.shippingPostalCode,
          total: String(loadedOrder.total),
          date: `${year}-${month}-${day}`,
          time: `${hours}:${minutes}`,
        });

      } catch (error) {
        console.error("LOAD ORDER ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load order"
        );

      } finally {
        setLoading(false);
      }
    };

    loadOrder();

  }, [orderId]);

  // ======================================================
  // Change Input
  // ======================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // Save
  // ======================================================

  const handleSave = async () => {
    try {
      if (!form.fullName.trim()) {
        alert("กรุณากรอกชื่อลูกค้า");
        return;
      }

      if (!form.email.trim()) {
        alert("กรุณากรอก Email");
        return;
      }

      if (!form.phone.trim()) {
        alert("กรุณากรอกเบอร์โทร");
        return;
      }

      if (!form.date || !form.time) {
        alert("กรุณาระบุวันที่และเวลา");
        return;
      }

      const total = Number(form.total);

      if (!Number.isFinite(total) || total < 0) {
        alert("ยอดเงินไม่ถูกต้อง");
        return;
      }

      setSaving(true);

      // สร้าง DateTime จากวันที่ + เวลา
      const createdAt = new Date(
        `${form.date}T${form.time}:00`
      ).toISOString();

      const res = await fetch(
        `/api/order/${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            recipientName: form.fullName.trim(),
            recipientEmail: form.email.trim(),
            recipientPhone: form.phone.trim(),
            shippingAddress: form.address.trim(),
            shippingPostalCode: form.postalCode.trim(),
            total,
            createdAt,
    }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update order"
        );
      }

      setOrder(data.order);

      alert("บันทึกข้อมูลเรียบร้อย");

      router.push("/admin/order-manager");

    } catch (error) {
      console.error("SAVE ORDER ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "บันทึกข้อมูลไม่สำเร็จ"
      );

    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // Input Style
  // ======================================================

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

return (
  <>
    <main className="min-h-screen bg-black text-white">

      <div className="mx-auto max-w-5xl px-6 pt-10">
        <AdminNav />
      </div>

        <div className="mx-auto max-w-5xl px-6 py-16">

          <p className="font-bold text-red-500">
            SUPER ADMIN
          </p>

          <h1 className="mt-2 text-5xl font-black">
            Edit Order
          </h1>

          {loading && (
            <div className="mt-10 rounded-3xl bg-zinc-900 p-8">

              <p className="text-zinc-400">
                กำลังโหลดข้อมูล Order...
              </p>

            </div>
          )}

          {!loading && error && (
            <div className="mt-10 rounded-3xl bg-zinc-900 p-8">

              <p className="font-bold text-red-500">
                {error}
              </p>

            </div>
          )}

          {!loading && order && (
            <>

              {/* Order ID */}

              <div className="mt-10 rounded-3xl bg-zinc-900 p-8">

                <p className="text-zinc-400">
                  Order ID
                </p>

                <h2 className="mt-2 text-3xl font-black text-red-500">
                  {order.id}
                </h2>

              </div>


              <div className="mt-6 grid gap-6 md:grid-cols-2">

                {/* Customer Information */}

                <div className="rounded-3xl bg-zinc-900 p-8">

                  <h2 className="mb-6 text-2xl font-bold">
                    Customer Information
                  </h2>

                  <div className="space-y-5">

                    <label className="block">
                      <span className="font-bold">
                        Name
                      </span>

                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </label>


                    <label className="block">
                      <span className="font-bold">
                        Email
                      </span>

                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </label>


                    <label className="block">
                      <span className="font-bold">
                        Phone
                      </span>

                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </label>


                    <label className="block">
                      <span className="font-bold">
                        Address
                      </span>

                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={4}
                        className={inputClass}
                      />
                    </label>


                    <label className="block">
                      <span className="font-bold">
                        Postal Code
                      </span>

                      <input
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </label>

                  </div>

                </div>


                {/* Order Information */}

                <div className="rounded-3xl bg-zinc-900 p-8">

                  <h2 className="mb-6 text-2xl font-bold">
                    Order Information
                  </h2>

                  <div className="space-y-5">

                    <label className="block">

                      <span className="font-bold">
                        Total
                      </span>

                      <input
                        name="total"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.total}
                        onChange={handleChange}
                        className={inputClass}
                      />

                    </label>


                    <label className="block">

                      <span className="font-bold">
                        Date
                      </span>

                      <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className={inputClass}
                      />

                    </label>


                    <label className="block">

                      <span className="font-bold">
                        Time
                      </span>

                      <input
                        name="time"
                        type="time"
                        value={form.time}
                        onChange={handleChange}
                        className={inputClass}
                      />

                    </label>


                    <div className="rounded-xl bg-zinc-800 p-5">

                      <p className="text-sm text-zinc-400">
                        Payment
                      </p>

                      <p className="mt-1 font-bold">
                        {order.paymentMethod}
                      </p>

                    </div>


                    <div className="rounded-xl bg-zinc-800 p-5">

                      <p className="text-sm text-zinc-400">
                        Status
                      </p>

                      <p className="mt-1 font-bold">
                        {order.status}
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* Products */}

              <div className="mt-6 rounded-3xl bg-zinc-900 p-8">

                <h2 className="mb-6 text-2xl font-bold">
                  Products
                </h2>

                <div className="space-y-3">

                  {order.items.map((item) => (

                    <div
                      key={item.id}
                      className="rounded-xl bg-zinc-800 p-5"
                    >

                      <p className="font-bold">
                        {item.product.name}
                      </p>

                      <p className="text-zinc-400">
                        Qty : {item.quantity}
                      </p>

                      <p className="text-zinc-400">
                        ฿{item.price.toLocaleString()}
                      </p>

                    </div>

                  ))}

                </div>

              </div>


              {/* Buttons */}

              <div className="mt-6 flex flex-wrap gap-4">

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="
                    rounded-xl
                    bg-red-600
                    px-8
                    py-4
                    font-bold
                    transition
                    hover:bg-red-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>


                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/order-manager"
                    )
                  }
                  disabled={saving}
                  className="
                    rounded-xl
                    bg-zinc-700
                    px-8
                    py-4
                    font-bold
                    transition
                    hover:bg-zinc-600
                  "
                >
                  Cancel
                </button>

              </div>

            </>
          )}

        </div>

      </main>
    </>
  );
}