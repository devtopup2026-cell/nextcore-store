"use client";

type Props = {
  search: string;
  setSearch: (value: string) => void;

  sort: string;
  setSort: (value: string) => void;
};

export default function ProductToolbar({
  search,
  setSearch,
  sort,
  setSort,
}: Props) {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search Products..."
        className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 w-full lg:w-96 focus:border-red-500 outline-none"
      />

    <select
  value={sort}
  onChange={(e) => setSort(e.target.value)}
  className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3"
>
  <option value="Newest">Newest</option>

  <option value="PriceLow">
    Price ต่ำ → สูง
  </option>

  <option value="PriceHigh">
    Price สูง → ต่ำ
  </option>

  <option value="Name">
    A-Z
  </option>
      </select>

    </div>
  );
}