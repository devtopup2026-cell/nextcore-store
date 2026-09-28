"use client";


import { useEffect, useState } from "react";
import AdminAccountPanel from "@/app/components/admin/AdminAccountPanel";

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

  total: number;
  paymentMethod: string;
  paymentSlip: string | null;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // ======================================================
  // Load Orders
  // ======================================================

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/order", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load orders");
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("LOAD ORDERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ======================================================
  // Update Order Status
  // ======================================================

  const updateOrderStatus = async (
    id: string,
    status: string
  ) => {
    try {
      setUpdatingId(id);

      const res = await fetch("/api/order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update order"
        );
      }

      // Update หน้าจอทันที
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );

    } catch (error) {
      console.error("UPDATE ORDER ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถเปลี่ยนสถานะ Order ได้"
      );
    } finally {
      setUpdatingId(null);
    }
  };


  // ======================================================
  // Dashboard
  // ======================================================
  const filteredOrders = orders.filter((order) => {
  const matchesStatus =
    statusFilter === "All" ||
    order.status === statusFilter;

  const search = searchTerm
    .trim()
    .toLowerCase();

const matchesSearch =
  search === "" ||
  order.id.toLowerCase().includes(search) ||
  order.recipientName.toLowerCase().includes(search) ||
  order.recipientEmail.toLowerCase().includes(search) ||
  order.recipientPhone.toLowerCase().includes(search);

  return matchesStatus && matchesSearch;
});

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending Payment"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  ).length;

const today = new Date();

const todaySales = orders
  .filter((order) => {
    const orderDate = new Date(order.createdAt);

    const isToday =
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getDate() === today.getDate();

    const isSale =
      order.status === "Paid" ||
      order.status === "Shipping" ||
      order.status === "Completed";

    return isToday && isSale;
  })
  .reduce(
    (total, order) => total + order.total,
    0
  );


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

const toggleOrderDetails = (orderId: string) => {
  setExpandedOrders((current) =>
    current.includes(orderId)
      ? current.filter((id) => id !== orderId)
      : [...current, orderId]
  );
};

  return (
    <>

      <main className="min-h-screen bg-black text-white">

        <div className="max-w-7xl mx-auto px-6 py-16">

      <div className="mb-10">

          <h1 className="text-5xl font-bold">
            NEXTCORE ADMIN
          </h1>

          <div className="mt-6 rounded-2xl bg-zinc-900 p-6">
            <AdminAccountPanel />
        </div>

      </div>


          {/* ======================================================
              Dashboard
          ====================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

            <div className="bg-zinc-900 rounded-3xl p-6">
              <h2 className="text-zinc-400 mb-2">
                Total Orders
              </h2>

              <p className="text-4xl font-bold text-red-500">
                {totalOrders}
              </p>
            </div>


            <div className="bg-zinc-900 rounded-3xl p-6">
              <h2 className="text-zinc-400 mb-2">
                Pending
              </h2>

              <p className="text-4xl font-bold text-yellow-500">
                {pendingOrders}
              </p>
            </div>


            <div className="bg-zinc-900 rounded-3xl p-6">
              <h2 className="text-zinc-400 mb-2">
                Completed
              </h2>

              <p className="text-4xl font-bold text-green-500">
                {completedOrders}
              </p>
            </div>


            <div className="bg-zinc-900 rounded-3xl p-6">
              <h2 className="text-zinc-400 mb-2">
                Today's Sales
              </h2>

              <p className="text-4xl font-bold text-red-500">
                ฿{todaySales.toLocaleString()}
              </p>
            </div>

          </div>


          {/* ======================================================
              Orders
          ====================================================== */}

          <div className="bg-zinc-900 rounded-3xl p-8">

            <h2 className="text-3xl font-bold mb-6">
              Latest Orders
            </h2>

            <div className="mb-6">
  <input
    type="text"
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
    placeholder="Search Order ID, Customer, Email or Phone..."
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

            <div className="flex flex-wrap gap-3 mb-6">

  {[
    "All",
    "Pending Payment",
    "Paid",
    "Shipping",
    "Completed",
    "Rejected",
  ].map((status) => (

    <button
      key={status}
      onClick={() => setStatusFilter(status)}
      className={`
        rounded-xl
        px-5
        py-3
        font-bold
        transition
        ${
          statusFilter === status
            ? "bg-red-600 text-white"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        }
      `}
    >
      {status}
    </button>

  ))}

</div>

{loading ? (
  <p className="text-zinc-400">
    กำลังโหลดรายการสั่งซื้อ...
  </p>
) : orders.length === 0 ? (
  <p className="text-zinc-400">
    ยังไม่มีรายการสั่งซื้อ
  </p>
) : filteredOrders.length === 0 ? (
  <div className="rounded-2xl bg-zinc-800 p-8 text-center">
    <p className="text-xl font-bold text-white">
      ไม่พบรายการสั่งซื้อ
    </p>

    <p className="mt-2 text-zinc-400">
      ลองเปลี่ยนคำค้นหาหรือสถานะ Order
    </p>
  </div>
) : (
  filteredOrders.map((order) => (

                <div
                  key={order.id}
                  className="mt-6 rounded-2xl bg-zinc-800 p-6"
                >

                  {/* ======================================================
                      Order Header
                  ====================================================== */}

                  <h2 className="text-3xl font-bold text-red-500">
                    {order.id}
                  </h2>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

  <div className="rounded-xl bg-zinc-900 p-4">
    <p className="text-sm text-zinc-400">
      Customer
    </p>

    <p className="font-bold">
      {order.recipientName}
    </p>
  </div>

  <div className="rounded-xl bg-zinc-900 p-4">
    <p className="text-sm text-zinc-400">
      Total
    </p>

    <p className="font-bold">
      ฿{order.total.toLocaleString()}
    </p>
  </div>

  <div className="rounded-xl bg-zinc-900 p-4">
    <p className="text-sm text-zinc-400">
      Status
    </p>

    <p className={`font-bold ${getStatusClass(order.status)}`}>
      {order.status}
    </p>
  </div>

</div>

<button
  onClick={() => toggleOrderDetails(order.id)}
  className="
    mt-5
    rounded-xl
    bg-zinc-700
    px-6
    py-3
    font-bold
    hover:bg-zinc-600
  "
>
  {expandedOrders.includes(order.id)
    ? "Hide Details"
    : "View Details"}
</button>

{expandedOrders.includes(order.id) && (

   <>
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* Customer Information */}

  <div className="rounded-2xl bg-zinc-900 p-6">

    <h3 className="text-xl font-bold mb-5">
      Customer Information
    </h3>

    <div className="space-y-3 text-zinc-300">

      <p>
        <span className="font-bold text-white">
          Name :
        </span>{" "}
        {order.recipientName}
      </p>

      <p>
        <span className="font-bold text-white">
          Email :
        </span>{" "}
        {order.recipientEmail}
      </p>

      <p>
        <span className="font-bold text-white">
          Phone :
        </span>{" "}
        {order.recipientPhone}
      </p>

      <p>
        <span className="font-bold text-white">
          Address :
        </span>{" "}
        {order.shippingAddress}
      </p>

      <p>
        <span className="font-bold text-white">
          Postal Code :
        </span>{" "}
        {order.shippingPostalCode}
      </p>

    </div>

  </div>


  {/* Order Information */}

  <div className="rounded-2xl bg-zinc-900 p-6">

    <h3 className="text-xl font-bold mb-5">
      Order Information
    </h3>

    <div className="space-y-3 text-zinc-300">

      <p>
        <span className="font-bold text-white">
          Payment :
        </span>{" "}
        {order.paymentMethod}
      </p>

      <p>
        <span className="font-bold text-white">
          Total :
        </span>{" "}
        ฿{order.total.toLocaleString()}
      </p>

      <p>
        <span className="font-bold text-white">
          Items :
        </span>{" "}
        {order.items.length}
      </p>

      <p>
        <span className="font-bold text-white">
          Status :
        </span>{" "}

        <span
          className={`font-bold ${getStatusClass(
            order.status
          )}`}
        >
          {order.status}
        </span>

      </p>

      <p>
        <span className="font-bold text-white">
          Created :
        </span>{" "}

        {new Date(
          order.createdAt
        ).toLocaleString()}

      </p>

    </div>

  </div>

</div>


                  {/* ======================================================
                      Products
                  ====================================================== */}

                  <div className="mt-6">

                    <h3 className="text-xl font-bold mb-3">
                      Products
                    </h3>


                    {order.items.map((item) => (

                      <div
                        key={item.id}
                        className="mb-3 rounded-xl bg-zinc-700 p-4"
                      >

                        <p className="font-bold">
                          {item.product.name}
                        </p>

                        <p>
                          Qty : {item.quantity}
                        </p>

                        <p>
                          ฿{item.price.toLocaleString()}
                        </p>

                      </div>

                    ))}

                  </div>


                  {/* ======================================================
                      Slip
                  ====================================================== */}

                  {order.paymentSlip && (

                    <button
                      onClick={() =>
                        window.open(
                          order.paymentSlip!,
                          "_blank"
                        )
                      }

                      className="
                        mt-4
                        rounded-xl
                        bg-blue-600
                        px-6
                        py-3
                        font-bold
                        hover:bg-blue-500
                      "
                    >
                      View Slip
                    </button>

                  )}


                  {/* ======================================================
                      Order Actions
                  ====================================================== */}

                  <div className="flex flex-wrap gap-3 mt-6">


                    {/* Approve */}

                    {order.status === "Pending Payment" && (

                      <button
                        disabled={
                          updatingId === order.id
                        }

                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "Paid"
                          )
                        }

                        className="
                          rounded-xl
                          bg-green-600
                          px-6
                          py-3
                          font-bold
                          hover:bg-green-500
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : "Approve"}
                      </button>

                    )}


                    {/* Shipping */}

                    {order.status === "Paid" && (

                      <button
                        disabled={
                          updatingId === order.id
                        }

                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "Shipping"
                          )
                        }

                        className="
                          rounded-xl
                          bg-orange-500
                          px-6
                          py-3
                          font-bold
                          hover:bg-orange-400
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : "Shipping"}
                      </button>

                    )}


                    {/* Complete */}

                    {order.status === "Shipping" && (

                      <button
                        disabled={
                          updatingId === order.id
                        }

                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "Completed"
                          )
                        }

                        className="
                          rounded-xl
                          bg-purple-600
                          px-6
                          py-3
                          font-bold
                          hover:bg-purple-500
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : "Complete"}
                      </button>

                    )}


                    {/* Reject */}

                    {order.status !== "Completed" &&
                      order.status !== "Rejected" && (

                        <button
                          disabled={
                            updatingId === order.id
                          }

                          onClick={() => {

                            const confirmed =
                              window.confirm(
                                "ต้องการ Reject Order นี้ใช่หรือไม่?"
                              );

                            if (!confirmed) {
                              return;
                            }

                            updateOrderStatus(
                              order.id,
                              "Rejected"
                            );

                          }}

                          className="
                            rounded-xl
                            bg-red-600
                            px-6
                            py-3
                            font-bold
                            hover:bg-red-500
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          {updatingId === order.id
                            ? "Updating..."
                            : "Reject"}
                        </button>

                      )}

                  </div>

                  </>
                )}

                </div>

              ))

            )}

          </div>

        </div>

      </main>
    </>
  );
}