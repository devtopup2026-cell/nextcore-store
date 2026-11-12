import { Text } from "@/app/i18n/language";
export default function PromoBar() {
  return (
    <section className="bg-red-600 text-white py-3 overflow-hidden">
      <div className="animate-pulse text-center font-semibold">
        <Text>{"🔥 RTX 5070 เริ่มต้น 24,900 บาท | 🚀 ประกอบคอมฟรี | 🎮 Gaming Gear ลดสูงสุด 30%"}</Text>
      </div>
    </section>
  );
}