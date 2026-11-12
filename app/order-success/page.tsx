import { Text } from "@/app/i18n/language";
import Link from "next/link";

export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: Promise<{ attachSlip?: string }>;
}) {
  const attachLater = (await searchParams).attachSlip === "later";

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="rounded-3xl bg-zinc-900 p-12 text-center">

        <h1 className="text-6xl font-black text-green-500">

          <Text>{attachLater ? "Order placed" : "SUCCESS"}</Text>

        </h1>

        <p className="mt-6 text-xl">

          <Text>{attachLater ? "Your order is awaiting a payment slip." : "ระบบได้รับข้อมูลการชำระเงินของคุณแล้ว"}</Text>

        </p>

        <p className="mt-3 text-zinc-400">

          <Text>{attachLater ? "You can upload your slip from Order History." : "กรุณารอการตรวจสอบจากทีมงาน NEXTCORE"}</Text>

        </p>

        <Link
          href={attachLater ? "/account" : "/"}
          className="
          mt-8
          inline-block
          rounded-xl
          bg-red-600
          px-8
          py-4
          font-bold
          "
        >
          <Text>{attachLater ? "Order History" : "กลับหน้าแรก"}</Text>
        </Link>

      </div>

    </main>

  );

}