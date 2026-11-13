"use client";
import { Text } from "@/app/i18n/language";


import { productCategories, productCategoryLabel } from "@/lib/product-categories";

const categories = ["All", ...productCategories];

type Props = {
  entries?: { key: string; name: string }[];
  category: string;
  setCategory: (value: string) => void;
};

export default function ProductFilter({
  category,
  entries,
  setCategory,
}: Props) {
 return (
  <aside className="min-w-0 rounded-2xl bg-zinc-900 p-4 sm:p-6">

    <h2 className="mb-4 text-xl font-bold sm:text-2xl lg:mb-6">
      <Text>{"Categories"}</Text>
    </h2>

    <div
      className="
        flex
        gap-2
        overflow-x-auto
        pb-2
        lg:block
        lg:space-y-3
        lg:overflow-visible
        lg:pb-0
      "
    >
      {(entries ? [{ key: "All", name: "All" }, ...entries] : categories.map((key) => ({ key, name: productCategoryLabel(key) }))).map(({ key: item, name }) => (
        <button
          key={item}
          type="button"
          onClick={() => setCategory(item)}
          className={`
            shrink-0
            whitespace-nowrap
            rounded-xl
            px-4
            py-3
            text-left
            transition
            lg:w-full

            ${
              category === item
                ? "bg-red-600 text-white"
                : "bg-zinc-800/60 hover:bg-zinc-800 lg:bg-transparent"
            }
          `}
        >
          <Text>{name}</Text>
        </button>
      ))}
    </div>

  </aside>
);
}