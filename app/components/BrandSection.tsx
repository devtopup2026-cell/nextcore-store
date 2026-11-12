import { Text } from "@/app/i18n/language";
export default function BrandSection() {

  const brands = [
    "ASUS",
    "MSI",
    "GIGABYTE",
    "AMD",
    "INTEL",
    "CORSAIR",
    "KINGSTON",
    "SAMSUNG",
  ];

  return (
    <section className="bg-black text-white py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-12">
          <Text>{"TOP BRANDS"}</Text>
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {brands.map((brand) => (

            <div
              key={brand}
              className="bg-zinc-900 p-8 rounded-xl text-center font-bold text-xl hover:border hover:border-red-500 transition"
            >
              {brand}
            </div>

          ))}

        </div>

      </div>

    </section>
  );
}