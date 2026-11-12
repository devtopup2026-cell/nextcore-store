export const buildPartCategories = [
  ["CPU", "Processor"],
  ["MAINBOARD", "Motherboard"],
  ["RAM", "Memory"],
  ["VGA", "Graphics Card"],
  ["SSD", "SSD Storage"],
  ["HDD", "HDD Storage"],
  ["PSU", "Power Supply"],
  ["CASE", "Computer Case"],
  ["COOLER", "CPU Cooler"],
] as const;

export const productCategories = [
  ...buildPartCategories.map(([category]) => category),
  "Monitor",
  "Keyboard",
  "Mouse",
  "Gaming Gear",
  "PC Set",
  "Other",
];

const categoryLabels: Readonly<Record<string, string>> = {
  MAINBOARD: "Motherboard",
  CASE: "Computer Case",
  COOLER: "CPU Cooler",
};

const aliases = new Map([
  ...productCategories.map((category): [string, string] => [category.toLowerCase(), category]),
  ["all", "All"],
  ["motherboard", "MAINBOARD"],
  ["main board", "MAINBOARD"],
  ["computer case", "CASE"],
  ["pc case", "CASE"],
  ["cpu cooler", "COOLER"],
]);

export function normalizeProductCategory(value: string) {
  const trimmed = value.trim();
  return aliases.get(trimmed.toLowerCase()) ?? trimmed;
}

export function productCategoryLabel(category: string) {
  const normalized = normalizeProductCategory(category);
  return Object.hasOwn(categoryLabels, normalized) ? categoryLabels[normalized] : normalized;
}
