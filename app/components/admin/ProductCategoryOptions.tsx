"use client";

import { useLanguage } from "@/app/i18n/language";
import { productCategories, productCategoryLabel } from "@/lib/product-categories";

export default function ProductCategoryOptions({ current }: { current?: string }) {
  const { translate } = useLanguage();

  return (
    <>
      <option value="">{translate("Select Category")}</option>
      {current && !productCategories.includes(current) && (
        <option value={current}>{current}</option>
      )}
      {productCategories.map((category) => (
        <option key={category} value={category}>
          {translate(productCategoryLabel(category))}
        </option>
      ))}
    </>
  );
}
