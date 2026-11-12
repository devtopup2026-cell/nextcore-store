"use client";
import { Text, useLanguage } from "@/app/i18n/language";


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
  const { translate } = useLanguage();
  return (
    <div className="mb-8 flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:justify-between lg:gap-5">

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={translate("Search Products...")}
        className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500 sm:px-5 lg:w-96"
      />

    <select
  value={sort}
  onChange={(e) => setSort(e.target.value)}
  className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500 sm:px-5 lg:w-auto"
>
  <option value="Newest"><Text>{"Newest"}</Text></option>

  <option value="PriceLow">
    <Text>{"Price ต่ำ → สูง"}</Text>
  </option>

  <option value="PriceHigh">
    <Text>{"Price สูง → ต่ำ"}</Text>
  </option>

  <option value="Name">
    A-Z
  </option>
      </select>

    </div>
  );
}