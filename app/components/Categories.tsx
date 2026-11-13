"use client";
import { useCatalogTaxonomy } from "@/lib/use-catalog-taxonomy";
import Link from "next/link";
import { productCategories, productCategoryLabel } from "@/lib/product-categories";
import { Text } from "@/app/i18n/language";


export default function Categories() {
  const taxonomy = useCatalogTaxonomy();
  const categories = [{ key: "Build PC", name: "Build PC" }, ...(taxonomy?.categories ?? productCategories.map((key) => ({ key, name: productCategoryLabel(key) })))];
  return (
    <section className="bg-black text-white py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-12">
          <Text>{"Product Categories"}</Text>
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {categories.map(({ key: item, name }) => (
            <Link
              key={item}
              href={item === "Build PC" ? "/buildpc" : `/products?category=${encodeURIComponent(item)}`}
              className="bg-zinc-900 p-8 rounded-2xl text-center hover:border-red-500 border border-transparent transition"
            >
              <h3 className="font-bold"><Text>{name}</Text></h3>
            </Link>
          ))}

        </div>

      </div>

    </section>
  );
}