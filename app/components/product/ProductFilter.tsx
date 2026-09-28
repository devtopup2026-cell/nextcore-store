"use client";

const categories = [
  "All",
  "CPU",
  "VGA",
  "RAM",
  "SSD",
  "Monitor",
  "Gaming Gear",
];

type Props = {
  category: string;
  setCategory: (value: string) => void;
};

export default function ProductFilter({
  category,
  setCategory,
}: Props) {
  return (
    <aside className="bg-zinc-900 rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-6">

        Categories

      </h2>

      <div className="space-y-3">

        {categories.map((item) => (

          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`

            w-full
            text-left
            px-4
            py-3
            rounded-xl
            transition

            ${
              category === item
                ? "bg-red-600 text-white"
                : "hover:bg-zinc-800"
            }

            `}
          >

            {item}

          </button>

        ))}

      </div>

    </aside>
  );
}