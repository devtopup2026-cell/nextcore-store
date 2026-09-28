import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({
  path: ".env.local",
});

async function main() {
  const { prisma } = await import("../lib/prisma");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD are required"
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const admin = await prisma.adminUser.upsert({
    where: {
      email,
    },

    update: {
      name: "NEXTCORE Staff Admin",
      password: hashedPassword,
      role: "ADMIN",
    },

    create: {
      name: "NEXTCORE Staff Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ STAFF ADMIN created successfully");
  console.log("Email:", admin.email);
  console.log("Role:", admin.role);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("❌ CREATE STAFF ADMIN ERROR:", error);
  process.exit(1);
});