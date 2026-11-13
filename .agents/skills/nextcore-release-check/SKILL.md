---
name: nextcore-release-check
description: ใช้เมื่อตรวจความพร้อมก่อนส่งมอบหรือเตรียมเผยแพร่ NEXTCORE โดยตรวจ Git ผลทดสอบ Prisma migration และวิธีย้อนกลับ
---

# ตรวจความพร้อมก่อนส่งมอบ NEXTCORE

1. ดู branch, commit และไฟล์ staged, unstaged และ untracked ด้วย `git status --short --branch`, `git diff` และ `git diff --cached` ระบุไฟล์นอกขอบเขตและตรวจว่ารายการส่งมอบไม่มีค่าลับหรือไฟล์สภาพแวดล้อมจริง
2. อ่านคำสั่งใน `package.json` เลือกตรวจตามขอบเขตและสิทธิ์ของงาน หากอนุญาตให้สร้างไฟล์ ให้รัน `npm run build` ซึ่งสร้าง Prisma Client ก่อน build Next.js และรัน lint ตามความเหมาะสม ถ้างานเป็นแบบอ่านอย่างเดียว ให้ใช้ TypeScript แบบ `--noEmit --incremental false` เมื่อ dependency มีพร้อม และรายงานข้อจำกัด เช่น Prisma Client ที่สร้างไว้เก่ากว่า schema
3. เทียบ `prisma/schema.prisma` กับ `prisma/migrations/` ระบุว่าต้องใช้ migration หรือไม่ หากงานรวมการเผยแพร่ ให้ตรวจว่าระบบ Railway ใช้ฐานและสภาพแวดล้อมที่ตั้งใจไว้ก่อนรัน migration การตรวจความพร้อมไม่ถือเป็นคำสั่งให้ push, deploy หรือเขียนฐานข้อมูล
4. สรุป commit หรือไฟล์ที่จะส่ง ผลตรวจจริง ขั้นตอนตรวจหลังเผยแพร่ และวิธีย้อนกลับ หากมี migration ให้ระบุผลของการย้อนโค้ดต่อข้อมูลใหม่และความเข้ากันได้กับ schema
