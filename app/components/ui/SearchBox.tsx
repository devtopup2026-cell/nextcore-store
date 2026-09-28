"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  useEffect(() => {
  const searchFromUrl = searchParams.get("search") || "";
  setSearch(searchFromUrl);
}, [searchParams]);


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const keyword = search.trim();

    if (!keyword) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="
          w-80
          bg-zinc-900
          border
          border-zinc-700
          rounded-xl
          px-4
          py-3
          outline-none
          focus:border-red-500
        "
      />
    </form>
  );
}