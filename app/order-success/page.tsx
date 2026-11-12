import { Text } from "@/app/i18n/language";
import Link from "next/link";

export default function OrderSuccess() {

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="rounded-3xl bg-zinc-900 p-12 text-center">

        <h1 className="text-6xl font-black text-green-500">

          <Text>{"SUCCESS"}</Text>

        </h1>

        <p className="mt-6 text-xl">

          <Text>{"ระบบได้รับข้อมูลการชำระเงินของคุณแล้ว"}</Text>

        </p>

        <p className="mt-3 text-zinc-400">

          <Text>{"กรุณารอการตรวจสอบจากทีมงาน NEXTCORE"}</Text>

        </p>

        <Link
          href="/"
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
          <Text>{"กลับหน้าแรก"}</Text>
        </Link>

      </div>

    </main>

  );

}