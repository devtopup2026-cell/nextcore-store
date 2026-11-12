import { Text, LanguageToggle } from "@/app/i18n/language";
import Link from "next/link";
import OrderSlipForm from "@/app/components/customer/OrderSlipForm";
import { canAttachPaymentSlip } from "@/lib/payment-slip";
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
      <div className="fixed right-4 top-4 z-40"><LanguageToggle /></div>
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
              <Text>{"My Account"}</Text>
            </h1>

            <p className="mt-2 text-zinc-400">
              <Text>{"ยินดีต้อนรับ"}</Text> {customer.fullName}
            </p>
          </div>

<div className="flex flex-wrap items-center gap-3">
  <Link
    href="/account/edit"
    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
  >
    <Text>{"Edit Profile"}</Text>
  </Link>

  <Link
    href="/"
    className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition hover:border-red-600 hover:text-red-500"
  >
    <Text>{"← กลับหน้าร้าน"}</Text>
  </Link>

  <CustomerLogoutButton />
</div>

        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-1">
            <h2 className="text-lg font-bold">
              <Text>{"ข้อมูลสมาชิก"}</Text>
            </h2>

            <div className="mt-6 space-y-5 text-sm">
              <div>
                <p className="text-zinc-500">
                  <Text>{"ชื่อ-นามสกุล"}</Text>
                </p>
                <p className="mt-1 text-white">
                  {customer.fullName}
                </p>
              </div>

              <div>
                <p className="text-zinc-500"><Text>{"Email"}</Text></p>
                <p className="mt-1 break-all text-white">
                  {customer.email}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">
                  <Text>{"เบอร์โทรศัพท์"}</Text>
                </p>
                <p className="mt-1 text-white">
                  {customer.phone}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">
                  <Text>{"ที่อยู่"}</Text>
                </p>
                <p className="mt-1 whitespace-pre-line text-white">
                  {customer.address}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">
                  <Text>{"รหัสไปรษณีย์"}</Text>
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
                  <Text>{"Order History"}</Text>
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  <Text>{"ประวัติการสั่งซื้อของคุณ"}</Text>
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
  <div className="mt-8 rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center">
    <p className="text-zinc-400">
      <Text>{"ยังไม่มีประวัติการสั่งซื้อ"}</Text>
    </p>

    <p className="mt-2 text-sm text-zinc-600">
      <Text>{"เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่"}</Text>
    </p>

    <Link
      href="/products"
      className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
    >
      <Text>{"เลือกซื้อสินค้า"}</Text>
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
              <Text>{"Order ID"}</Text>
            </p>

            <p className="mt-1 font-semibold text-white">
              {order.id}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-zinc-500">
              <Text>{"สถานะ"}</Text>
            </p>

            <p className="mt-1 font-semibold text-red-500">
              <Text>{order.status}</Text>
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
                  <Text>{"จำนวน"}</Text> {item.quantity}
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
              <Text>{"ยอดรวม"}</Text>
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              ฿{order.total.toLocaleString("th-TH")}
            </p>
          </div>
        </div>
        {canAttachPaymentSlip(order) && <OrderSlipForm orderId={order.id} />}
        {order.paymentSlip && (
          <p className="mt-4 text-sm text-green-400"><Text>{"Payment slip attached"}</Text></p>
        )}
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