BEGIN;
CREATE TABLE "CatalogCategory" (
  "key" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE,
  "image" TEXT, "description" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "visible" BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE "CatalogBrand" (
  "key" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "nameKey" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE, "image" TEXT, "visible" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "CatalogCategory" ("key","name","slug","sortOrder") VALUES
 ('CPU','CPU','cpu',1), ('MAINBOARD','Motherboard','mainboard',2), ('RAM','RAM','ram',3),
 ('VGA','VGA','vga',4), ('SSD','SSD','ssd',5), ('HDD','HDD','hdd',6),
 ('PSU','PSU','psu',7), ('CASE','Computer Case','case',8), ('COOLER','CPU Cooler','cooler',9),
 ('Monitor','Monitor','monitor',10), ('Keyboard','Keyboard','keyboard',11), ('Mouse','Mouse','mouse',12),
 ('Gaming Gear','Gaming Gear','gaming-gear',13), ('PC Set','PC Set','pc-set',14), ('Other','Other','other',15);
INSERT INTO "CatalogBrand" ("key","name","nameKey","slug")
SELECT min(btrim("brand")), min(btrim("brand")), lower(btrim("brand")),
       'brand-' || encode(convert_to(lower(btrim("brand")), 'UTF8'), 'hex')
FROM "Product" WHERE btrim("brand") <> '' GROUP BY lower(btrim("brand"));
COMMIT;
