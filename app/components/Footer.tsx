import { Text } from "@/app/i18n/language";
export default function Footer() {
  return (
    <footer className="bg-black border-t border-red-600 text-white py-10">

      <div className="max-w-7xl mx-auto px-6 text-center">

        <h3 className="text-2xl font-bold text-red-500 mb-4">
          NEXTCORE
        </h3>

        <p className="text-zinc-400">
          <Text>{"Computer • Gaming • Custom PC"}</Text>
        </p>

        <p className="text-zinc-500 mt-4">
          <Text>{"© 2026 NEXTCORE All Rights Reserved"}</Text>
        </p>

      </div>

    </footer>
  );
}