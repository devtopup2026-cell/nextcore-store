"use client";
import { Text, useLanguage } from "@/app/i18n/language";


import AdminNav from "@/app/components/admin/AdminNav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
};

export default function OrderManagerPage() {
  const { translate } = useLanguage();
const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  

  // ======================================================
  // Load Orders
  // ======================================================

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/order", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load orders"
          );
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error(
          "LOAD ORDER MANAGER ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // ======================================================
  // Search
  // ======================================================

  const search = searchTerm
    .trim()
    .toLowerCase();

  const filteredOrders = orders.filter((order) => {
  if (!search) return true;

  return (
    order.id.toLowerCase().includes(search) ||
    order.recipientName
      .toLowerCase()
      .includes(search) ||
    order.recipientEmail
      .toLowerCase()
      .includes(search) ||
    order.recipientPhone
      .toLowerCase()
      .includes(search)
  );
});

  // ======================================================
  // Status Style
  // ======================================================

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Pending Payment":
        return "text-yellow-400";

      case "Paid":
        return "text-green-400";

      case "Shipping":
        return "text-orange-400";

      case "Completed":
        return "text-green-500";

      case "Rejected":
        return "text-red-500";

      default:
        return "text-white";
    }
  };

return (
  <>
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 pt-10">
        <AdminNav />
      </div>

        <div className="mx-auto max-w-7xl px-6 pb-16">

          <div className="mb-10">

            <p className="mb-2 font-bold text-red-500">
              <Text>{"SUPER ADMIN"}</Text>
            </p>

            <h1 className="text-5xl font-black">
              <Text>{"Order Manager"}</Text>
            </h1>

            <p className="mt-3 text-zinc-400">
              <Text>{"Search and edit customer and order information."}</Text>
            </p>

          </div>


          {/* Search */}

          <div className="rounded-3xl bg-zinc-900 p-8">

            <h2 className="mb-5 text-2xl font-bold">
              <Text>{"Search Orders"}</Text>
            </h2>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder={translate("Search Order ID, Customer, Email or Phone...")}
              className="
                w-full
                rounded-xl
                border
                border-zinc-700
                bg-zinc-800
                px-5
                py-4
                text-white
                outline-none
                transition
                placeholder:text-zinc-500
                focus:border-red-500
              "
            />

          </div>


          {/* Orders */}

          <div className="mt-8 rounded-3xl bg-zinc-900 p-8">

            <div className="mb-6 flex items-center justify-between gap-4">

              <h2 className="text-3xl font-bold">
                <Text>{"Orders"}</Text>
              </h2>

              <p className="text-zinc-400">
                {filteredOrders.length} <Text>{"orders"}</Text>
              </p>

            </div>


            {loading ? (

              <p className="text-zinc-400">
                <Text>{"กำลังโหลดรายการสั่งซื้อ..."}</Text>
              </p>

            ) : orders.length === 0 ? (

              <p className="text-zinc-400">
                <Text>{"ยังไม่มีรายการสั่งซื้อ"}</Text>
              </p>

            ) : filteredOrders.length === 0 ? (

              <div className="rounded-2xl bg-zinc-800 p-8 text-center">

                <p className="text-xl font-bold">
                  <Text>{"ไม่พบรายการสั่งซื้อ"}</Text>
                </p>

                <p className="mt-2 text-zinc-400">
                  <Text>{"ลองค้นหาด้วย Order ID ชื่อลูกค้า Email หรือเบอร์โทร"}</Text>
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {filteredOrders.map((order) => (

                  <div
                    key={order.id}
                    className="
                      rounded-2xl
                      border
                      border-zinc-700
                      bg-zinc-800
                      p-6
                    "
                  >

                    <div className="
                      flex
                      flex-col
                      gap-6
                      xl:flex-row
                      xl:items-center
                      xl:justify-between
                    ">

                      <div>

                        <h3 className="text-2xl font-black text-red-500">
                          {order.id}
                        </h3>

                        <div className="mt-4 space-y-1 text-zinc-300">

                          <p>
                            <span className="font-bold text-white">
                              Customer :
                            </span>{" "}
                            {order.recipientName}
                          </p>

                          <p>
                            <span className="font-bold text-white">
                              <Text>{"Phone :"}</Text>
                            </span>{" "}
                            {order.recipientPhone}
                          </p>

                          <p>
                            <span className="font-bold text-white">
                              <Text>{"Total :"}</Text>
                            </span>{" "}
                            ฿{order.total.toLocaleString()}
                          </p>

                          <p>
                            <span className="font-bold text-white">
                              <Text>{"Status :"}</Text>
                            </span>{" "}

                            <span
                              className={`font-bold ${getStatusClass(
                                order.status
                              )}`}
                            >
                              <Text>{order.status}</Text>
                            </span>

                          </p>

                          <p>
                            <span className="font-bold text-white">
                              <Text>{"Created :"}</Text>
                            </span>{" "}

                            {new Date(
                              order.createdAt
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>


                      <div className="shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/order-manager/${order.id}`
                        )
                      }
                      className="
                        rounded-xl
                        bg-red-600
                        px-7
                        py-4
                        font-bold
                        transition
                        hover:bg-red-500
                      "
                    >
                      <Text>{"Edit Order"}</Text>
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
    </>
  );
}