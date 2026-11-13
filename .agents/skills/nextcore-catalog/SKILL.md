---
name: nextcore-catalog
description: ใช้เมื่อเพิ่มหรือแก้สินค้า หมวดหมู่ ตัวกรอง หรือรายการชิ้นส่วน Build PC ในโปรเจกต์ NEXTCORE
---

# จัดการแค็ตตาล็อก NEXTCORE

1. เริ่มจาก `lib/product-categories.ts` สำหรับค่าหมวดที่จัดเก็บ ชื่อแสดงผล และชื่อเดิมที่รองรับ ตรวจข้อมูลจริงผ่าน `app/api/products/route.ts` และ `prisma/schema.prisma` เมื่อโจทย์เกี่ยวกับข้อมูลสินค้า
2. เมื่อแก้หมวด ตรวจ `app/components/admin/ProductCategoryOptions.tsx` และหน้าเพิ่ม/แก้สินค้าใน `app/admin/products/` จากนั้นตรวจหน้าแรก `app/components/Categories.tsx` ตัวกรอง `app/components/product/ProductFilter.tsx` และ `hooks/useProducts.ts` ให้ใช้ค่าหมวดเดียวกัน รวมถึงลิงก์ query เดิมและข้อมูลหมวดเดิม
3. ถ้าเป็นหมวดชิ้นส่วน ตรวจการเลือกใน `app/buildpc/page.tsx` และการส่งสินค้ากับจำนวนไปตะกร้า ตรวจป้ายไทยและอังกฤษใน `app/i18n/translations.ts` เมื่อเพิ่มชื่อแสดงผล
4. เมื่อแก้การเปิดขาย ให้ตรวจรายการสาธารณะ หน้ารายละเอียด `app/products/[slug]/page.tsx` และการสร้างออเดอร์ สินค้าที่ปิดขายยังต้องเปิดแก้ในหลังบ้านได้และออเดอร์เก่าต้องอ้างอิงได้ คงการป้องกันการลบสินค้าที่อยู่ในออเดอร์ใน `app/api/admin/products/[id]/route.ts`
5. ทดสอบตามส่วนที่เปลี่ยนด้วยสินค้าในฐานทดสอบ รวมกรณีหมวดเดิม สินค้าปิดขาย และการเลือกชิ้นส่วนถ้าเกี่ยวข้อง
