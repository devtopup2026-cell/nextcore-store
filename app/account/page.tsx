import Link from "next/link";
import { redirect } from "next/navigation";

import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";
import CustomerLogoutButton from "@/app/components/customer/CustomerLogoutButton";


export default async function AccountPage() {
  const customer = await getCustomerSession();

  if (!customer) {
    redirect("/login");
  }


  const orders = await prisma.order.findMany({
  where: {
    customerId: customer.id,
  },
  include: {
    items: {
      include: {
        product: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-2xl font-black tracking-wider"
            >
              NEXT<span className="text-red-600">CORE</span>
            </Link>

            <h1 className="mt-5 text-3xl font-bold">
              My Account
            </h1>

            <p className="mt-2 text-zinc-400">
              ยินดีต้อนรับ {customer.fullName}
            </p>
          </div>

<div className="flex flex-wrap items-center gap-3">
  <Link
    href="/account/edit"
    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
  >
    Edit Profile
  </Link>

  <Link
    href="/"
    className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition hover:border-red-600 hover:text-red-500"
  >
    ← กลับหน้าร้าน
  </Link>

  <CustomerLogoutButton />
</div>

        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-1">
            <h2 className="text-lg font-bold">
              ข้อมูลสมาชิก
            </h2>

            <div className="mt-6 space-y-5 text-sm">
              <div>
                <p className="text-zinc-500">
                  ชื่อ-นามสกุล
                </p>
                <p className="mt-1 text-white">
                  {customer.fullName}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Email</p>
                <p className="mt-1 break-all text-white">
                  {customer.email}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">
                  เบอร์โทรศัพท์
                </p>
                <p className="mt-1 text-white">
                  {customer.phone}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">
                  ที่อยู่
                </p>
                <p className="mt-1 whitespace-pre-line text-white">
                  {customer.address}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">
                  รหัสไปรษณีย์
                </p>
                <p className="mt-1 text-white">
                  {customer.postalCode}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Order History
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  ประวัติการสั่งซื้อของคุณ
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
  <div className="mt-8 rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center">
    <p className="text-zinc-400">
      ยังไม่มีประวัติการสั่งซื้อ
    </p>

    <p className="mt-2 text-sm text-zinc-600">
      เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่
    </p>

    <Link
      href="/products"
      className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
    >
      เลือกซื้อสินค้า
    </Link>
  </div>
) : (
  <div className="mt-6 space-y-4">
    {orders.map((order) => (
      <div
        key={order.id}
        className="rounded-xl border border-zinc-800 bg-black p-5"
      >
        <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-zinc-500">
              Order ID
            </p>

            <p className="mt-1 font-semibold text-white">
              {order.id}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-zinc-500">
              สถานะ
            </p>

            <p className="mt-1 font-semibold text-red-500">
              {order.status}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-medium text-white">
                  {item.product.name}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  จำนวน {item.quantity}
                </p>
              </div>

              <p className="whitespace-nowrap text-sm text-zinc-300">
                ฿
                {(
                  item.price * item.quantity
                ).toLocaleString("th-TH")}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-zinc-800 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-sm text-zinc-500">
            {new Intl.DateTimeFormat("th-TH", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Bangkok",
            }).format(order.createdAt)}
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-zinc-500">
              ยอดรวม
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              ฿{order.total.toLocaleString("th-TH")}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
          </section>
        </div>
      </div>
    </main>
  );
}