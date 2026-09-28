"use client";

import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/store/cart.store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerStore } from "@/store/customer.store";
import { generateOrderId } from "@/lib/generateOrderId";
import type { Order } from "@/types/order";

export default function PaymentPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
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
   },[]);


   if(!mounted){
      return null;
   }

  
const handleConfirmPayment = async () => {
  if (!preview) {
    alert("กรุณาอัปโหลดสลิป");
    return;
  }

  if (submitting) {
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
        data?.error ||
          "บันทึกออเดอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      );

      return;
    }

    clear();
    clearCustomer();

    router.push("/order-success");
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
            Payment
          </h1>


          <div className="rounded-3xl bg-zinc-900 p-10">

            {/* QR */}

            <div className="flex flex-col items-center">

              <h2 className="text-3xl font-bold mb-8">
                PromptPay QR
              </h2>


              <div className="rounded-2xl bg-white p-5">

<Image
    src="/payment/promptpay-qr.png"
    alt="PromptPay"
    width={500}
    height={900}
/>

              </div>


              <p className="mt-6 text-zinc-400">
                NEXTCORE STORE
              </p>


              <p className="mt-2 text-xl font-bold">
                08X-XXX-XXXX
              </p>


              <div className="mt-8 rounded-xl bg-red-600 px-8 py-4">

                <p className="text-lg">
                  Amount
                </p>

                <h3 className="text-4xl font-black">

                  ฿{totalPrice().toLocaleString()}

                </h3>
               
              </div>

            </div>
 <div className="mt-8 w-full rounded-2xl bg-zinc-800 p-6">

  <h2 className="mb-4 text-2xl font-bold">
    Customer Information
  </h2>

  <div className="space-y-2 text-zinc-300">

    <p>
      <span className="font-bold text-white">
        Name :
      </span>{" "}
      {fullName}
    </p>

    <p>
      <span className="font-bold text-white">
        Phone :
      </span>{" "}
      {phone}
    </p>

    <p>
      <span className="font-bold text-white">
        Email :
      </span>{" "}
      {email}
    </p>

    <p>
      <span className="font-bold text-white">
        Postal Code :
      </span>{" "}
      {postalCode}
    </p>

    <p>
      <span className="font-bold text-white">
        Payment :
      </span>{" "}
      {paymentMethod}
    </p>

    <p>
      <span className="font-bold text-white">
        Address :
      </span>{" "}
      {address}
    </p>

  </div>

</div>

            {/* Upload */}

            <div className="mt-12">

              <h2 className="text-2xl font-bold">
                Upload Payment Slip
              </h2>


<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

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
                    Payment Slip Preview
                  </h3>

                  <img
                    src={preview}
                    alt="Slip Preview"
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
  disabled={submitting}
  onClick={handleConfirmPayment}
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
  ? "Processing..."
  : "Confirm Payment"}
</button>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}