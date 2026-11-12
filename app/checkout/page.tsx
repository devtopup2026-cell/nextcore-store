"use client";
import { Text, useLanguage } from "@/app/i18n/language";

import { useEffect, useState } from "react";
import { paymentAccounts } from "@/lib/payment-accounts";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/store/cart.store";
import Link from "next/link";
import { useOrderStore } from "@/store/order.store";
import { generateOrderId } from "@/lib/generateOrderId";
import { useCustomerStore } from "@/store/customer.store";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { translate } = useLanguage();
  const id = generateOrderId();
  const { items, totalPrice } = useCart();
  const router = useRouter();

const { setCustomer } = useCustomerStore();
const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [isMember, setIsMember] = useState(false);
const [postalCode, setPostalCode] = useState("");
const [address, setAddress] = useState("");
const [mounted, setMounted] = useState(false);
const [paymentMethod, setPaymentMethod] =
useState("PromptPay");

const [checkingStock, setCheckingStock] = useState(false);

useEffect(() => {
  setMounted(true);

  async function loadCustomer() {
    try {
      const res = await fetch("/api/customer/me", {
        cache: "no-store",
      });

      // ไม่ได้ Login = Guest Checkout
      // ปล่อยช่องข้อมูลว่างเหมือนเดิม
      if (!res.ok) {
        return;
      }

      const data = await res.json();

      if (!data.success || !data.customer) {
        return;
      }

      setIsMember(true);

      setFullName(data.customer.fullName || "");
      setPhone(data.customer.phone || "");
      setEmail(data.customer.email || "");
      setAddress(data.customer.address || "");
      setPostalCode(data.customer.postalCode || "");
    } catch (error) {
      console.error("LOAD CUSTOMER ERROR:", error);

      // ถ้าโหลด Member ไม่ได้
      // ยังสามารถใช้ Guest Checkout ต่อได้
    }
  }

  loadCustomer();
}, []);

if (!mounted) return null;
  return (
    
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <h1 className="text-5xl font-black mb-10">
            <Text>{"Checkout"}</Text>
          </h1>

          <div className="grid lg:grid-cols-3 gap-10">


            {/* LEFT */}

            <div className="lg:col-span-2 space-y-8">

              {/* Customer */}

              <div className="rounded-2xl bg-zinc-900 p-8">

                <h2 className="text-2xl font-bold mb-6">
                  <Text>{"Customer Information"}</Text>
                </h2>

                <div className="grid md:grid-cols-2 gap-5">

                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={translate("Full Name")}
                    className="rounded-xl bg-zinc-800 p-4"
                  />

<input
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder={translate("Phone Number")}
  className="rounded-xl bg-zinc-800 p-4"
/>

<input
  type="email"
  placeholder={translate("Email")}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  readOnly={isMember}
  className={`w-full rounded-lg border border-zinc-700 p-4 text-white outline-none ${
    isMember
      ? "cursor-not-allowed bg-zinc-800 text-zinc-400"
      : "bg-zinc-900"
  }`}
/>

<input
  value={postalCode}
  onChange={(e) => setPostalCode(e.target.value)}
  placeholder={translate("Postal Code")}
  className="rounded-xl bg-zinc-800 p-4"
/>

<textarea
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  placeholder={translate("Address")}
  className="mt-5 h-32 w-full rounded-xl bg-zinc-800 p-4"
/>

              </div>


              {/* PAYMENT */}

              <div className="rounded-2xl bg-zinc-900 p-8">

                <h2 className="text-2xl font-bold mb-6">
                  <Text>{"Payment Method"}</Text>
                </h2>

                <div className="space-y-4">

                  <label className="flex gap-3">

                <input
                type="radio"
                name="payment"
                checked={paymentMethod === "PromptPay"}
                onChange={() => setPaymentMethod("PromptPay")}
                />

                    <Text>{paymentAccounts.PromptPay.label}</Text>

                  </label>

                  <label className="flex gap-3">

                <input
                type="radio"
                name="payment"
                checked={paymentMethod === "Bank Transfer"}
                onChange={() => setPaymentMethod("Bank Transfer")}
                />

                    <Text>{paymentAccounts["Bank Transfer"].label}</Text>

                  </label>

                  <label className="flex gap-3 text-zinc-500">

                    <input
                      type="radio"
                      disabled
                    />

                    <Text>{"Credit Card (Coming Soon)"}</Text>

                  </label>

                </div>

              </div>

            </div>



            {/* RIGHT */}

            <div className="rounded-2xl bg-zinc-900 p-8 h-fit">

              <h2 className="text-3xl font-bold">
                <Text>{"Order Summary"}</Text>
              </h2>


              <div className="mt-8 space-y-4">

                {items.map((item) => (

                  <div
                    key={item.product.id}
                    className="flex justify-between"
                  >

                    <span>
                      {item.product.name}
                      x{item.quantity}
                    </span>

                    <span>
                      ฿{
                        (
                          item.product.price *
                          item.quantity
                        ).toLocaleString()
                      }
                    </span>

                  </div>

                ))}

              </div>


              <hr className="my-6 border-zinc-700" />

              <div className="flex justify-between">

                <span><Text>{"Shipping"}</Text></span>

                <span><Text>{"FREE"}</Text></span>

              </div>


              <hr className="my-6 border-zinc-700" />


              <div className="flex justify-between text-3xl font-black text-red-500">

                <span><Text>{"Total"}</Text></span>

                <span>
                  ฿{totalPrice().toLocaleString()}
                </span>

              </div>


              <button
disabled={checkingStock}
onClick={async () => {
  if (
    !fullName ||
    !phone ||
    !email ||
    !address ||
    !postalCode
  ) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  if (items.length === 0) {
    alert("ไม่มีสินค้าในตะกร้า");
    return;
  }

  try {
    setCheckingStock(true);

    const res = await fetch("/api/products", {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(
        data.error || "ไม่สามารถตรวจสอบสินค้าได้"
      );
    }

    for (const item of items) {
      const latestProduct = data.products.find(
        (product: { id: number }) =>
          product.id === item.product.id
      );

      if (!latestProduct) {
        alert(
          `ไม่พบสินค้า "${item.product.name}" ในระบบ`
        );
        return;
      }

      if (latestProduct.stock < item.quantity) {
        alert(
          `"${item.product.name}" มีสินค้าเหลือเพียง ${latestProduct.stock} ชิ้น`
        );
        return;
      }
    }

    setCustomer({
      fullName,
      phone,
      email,
      address,
      postalCode,
      paymentMethod,
    });

    router.push("/payment");
  } catch (error) {
    console.error(
      "CHECK STOCK ERROR:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "ตรวจสอบ Stock ไม่สำเร็จ"
    );
  } finally {
    setCheckingStock(false);
  }
}}

              className="
              disabled:cursor-not-allowed
              disabled:opacity-50
              mt-8
              w-full
              rounded-xl
              bg-red-600
              px-8
              py-4
              font-bold
              hover:bg-red-700
              transition
              "
              >

              {checkingStock
  ? <Text>{"Checking Stock..."}</Text>
  : <Text>{"Proceed To Payment"}</Text>}

              </button>

            </div>
</div>
          </div>

        </div>

      </main>

      <Footer />

    </>
  );
}