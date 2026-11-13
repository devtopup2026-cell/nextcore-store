"use client";
import { useEffect, useState } from "react";
import type { TaxonomyEntry } from "@/lib/catalog-taxonomy";

export function useCatalogTaxonomy(admin = false) {
  const [data, setData] = useState<{ categories: TaxonomyEntry[]; brands: TaxonomyEntry[] }>();
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog-taxonomy" + (admin ? "?admin" : ""), { signal: controller.signal })
      .then(async (response) => { if (response.ok) setData(await response.json()); })
      .catch(() => {});
    return () => controller.abort();
  }, [admin]);
  return data;
}
