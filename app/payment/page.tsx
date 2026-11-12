"use client";
import { Text, useLanguage } from "@/app/i18n/language";


import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/store/cart.store";
import Image from "next/image";
import { paymentAccounts } from "@/lib/payment-accounts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerStore } from "@/store/customer.store";
import { generateOrderId } from "@/lib/generateOrderId";
import type { Order } from "@/types/order";

export default function PaymentPage() {
  const { translate } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const { clearCustomer } = useCustomerStore();
  const {
    items,
    totalPrice,
    clear,
  } = useCart();


  const [mounted,setMounted] = useState(false);
     const {
     fullName,
     phone,
     email,
     address,
     postalCode,
     paymentMethod,
        } = useCustomerStore();

   useEffect(()=>{
      setMounted(true);
      fetch("/api/customer/me", { cache: "no-store" })
        .then((response) => setIsMember(response.ok))
        .catch(() => setIsMember(false));
   },[]);


   if(!mounted){
      return null;
   }

  
const account = paymentMethod === "Bank Transfer"
  ? paymentAccounts["Bank Transfer"]
  : paymentAccounts.PromptPay;

const handleConfirmPayment = async (attachLater = false) => {
  if (!preview && !(attachLater && isMember)) {
    alert(translate("Attach a slip or sign in to submit it later."));
    return;
  }

  if (submitting || uploading) {
    return;
  }

  setSubmitting(true);

  try {
    const order: Order = {
      id: generateOrderId(),

      customer: {
        fullname: fullName,
        email,
        phone,
        address,
        postalCode,
      },

      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),

      total: totalPrice(),

      paymentMethod,
      paymentSlip: preview ?? undefined,
      status: "Pending Payment",
      createdAt: new Date().toISOString(),
    };

    const res = await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);

      alert(
        (data?.error && translate(data.error)) ||
          "บันทึกออเดอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      );

      return;
    }

    clear();
    clearCustomer();

    router.push(preview ? "/order-success" : "/order-success?attachSlip=later");
  } catch (error) {
    console.error("CONFIRM PAYMENT ERROR:", error);

    alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  } finally {
    setSubmitting(false);
  }
};
   
  return (
    <>
      <Header />

      <main className="min-h-screen bg-black text-white">

        <div className="max-w-5xl mx-auto px-6 py-16">

          <h1 className="text-5xl font-black mb-10">
            <Text>{"Payment"}</Text>
          </h1>


          <div className="rounded-3xl bg-zinc-900 p-5 sm:p-10">

            <div className="flex flex-col items-center">
              <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">
                <Text>{account.label}</Text>
              </h2>
              <p className="mb-5 text-center text-sm text-zinc-300">
                <Text>{"QR payments are temporarily unavailable. Please transfer to the account below."}</Text>
              </p>
              <Image
                src={account.image}
                alt=""
                width={1200}
                height={800}
                sizes="(max-width: 640px) 100vw, 672px"
                className="aspect-[2/1] w-full max-w-2xl rounded-2xl object-cover"
              />
              <dl className="mt-5 w-full max-w-2xl space-y-3 rounded-xl bg-black/35 p-4 sm:p-6">
                <div>
                  <dt className="text-sm text-zinc-400"><Text>{"Bank"}</Text></dt>
                  <dd className="font-semibold"><Text>{account.bank}</Text></dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-400"><Text>{"Account number"}</Text></dt>
                  <dd className="select-all font-mono text-xl font-bold tabular-nums">{account.number}</dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-400"><Text>{"Account name"}</Text></dt>
                  <dd className="font-semibold" lang="th">{account.holder}</dd>
                </div>
              </dl>

              <div className="mt-8 rounded-xl bg-red-600 px-8 py-4">

                <p className="text-lg">
                  <Text>{"Amount"}</Text>
                </p>

                <h3 className="text-4xl font-black">

                  ฿{totalPrice().toLocaleString()}

                </h3>
               
              </div>

            </div>
 <div className="mt-8 w-full rounded-2xl bg-zinc-800 p-6">

  <h2 className="mb-4 text-2xl font-bold">
    <Text>{"Customer Information"}</Text>
  </h2>

  <div className="space-y-2 text-zinc-300">

    <p>
      <span className="font-bold text-white">
        <Text>{"Name :"}</Text>
      </span>{" "}
      {fullName}
    </p>

    <p>
      <span className="font-bold text-white">
        <Text>{"Phone :"}</Text>
      </span>{" "}
      {phone}
    </p>

    <p>
      <span className="font-bold text-white">
        <Text>{"Email :"}</Text>
      </span>{" "}
      {email}
    </p>

    <p>
      <span className="font-bold text-white">
        <Text>{"Postal Code :"}</Text>
      </span>{" "}
      {postalCode}
    </p>

    <p>
      <span className="font-bold text-white">
        <Text>{"Payment :"}</Text>
      </span>{" "}
      <Text>{account.label}</Text>
    </p>

    <p>
      <span className="font-bold text-white">
        <Text>{"Address :"}</Text>
      </span>{" "}
      {address}
    </p>

  </div>

</div>

            {/* Upload */}

            <div className="mt-12">

              <h2 className="text-2xl font-bold">
                <Text>{"Upload Payment Slip"}</Text>
              </h2>


<input
  type="file"
  accept="image/*"
  disabled={uploading || submitting}
  onChange={async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;
    setUploading(true);
    setPreview(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Upload failed");
        return;
      }

      setPreview(data.url);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }}
  className="
    mt-6
    w-full
    rounded-xl
    border
    border-zinc-700
    bg-zinc-800
    p-4
  "
/>

            {
              preview && (

                <div className="mt-8">

                  <h3 className="mb-4 text-xl font-bold">
                    <Text>{"Payment Slip Preview"}</Text>
                  </h3>

                  <img
                    src={preview}
                    alt={translate("Slip Preview")}
                    className="
                    rounded-xl
                    border
                    border-zinc-700
                    max-h-[500px]
                    "
                  />

                </div>

  )
}

<button
  disabled={submitting || uploading || !preview}
  onClick={() => handleConfirmPayment()}
  className="
    disabled:cursor-not-allowed
    disabled:opacity-50
    mt-6
    w-full
    rounded-xl
    bg-red-600
    py-4
    text-lg
    font-bold
    transition
    hover:bg-red-500
  "
>
  {submitting
  ? <Text>{"Processing..."}</Text>
  : <Text>{uploading ? "Uploading slip..." : "Confirm Payment"}</Text>}
</button>

{isMember && !preview && (
  <div className="mt-4 space-y-2">
    <button
      type="button"
      disabled={submitting || uploading}
      onClick={() => handleConfirmPayment(true)}
      className="w-full rounded-xl border border-zinc-700 px-4 py-3 font-bold hover:border-red-500 disabled:opacity-50"
    >
      <Text>{"Place order and attach slip later"}</Text>
    </button>
    <p className="text-sm text-zinc-400"><Text>{"You can upload your slip from Order History."}</Text></p>
  </div>
)}

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}