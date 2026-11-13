"use client";

import { useCatalogTaxonomy } from "@/lib/use-catalog-taxonomy";
import { useLanguage } from "@/app/i18n/language";
import { productCategories, productCategoryLabel } from "@/lib/product-categories";

export default function ProductCategoryOptions({ current }: { current?: string }) {
  const { translate } = useLanguage();

  const data = useCatalogTaxonomy(true);
  const entries = data?.categories ?? productCategories.map((key) => ({ key, name: productCategoryLabel(key) }));
  return (
    <>
      <option value="">{translate("Select Category")}</option>
      {current && !entries.some(({ key }) => key === current) && (
        <option value={current}>{current}</option>
      )}
      {entries.map(({ key, name }) => (
        <option key={key} value={key}>
          {translate(name)}
        </option>
      ))}
    </>
  );
}
