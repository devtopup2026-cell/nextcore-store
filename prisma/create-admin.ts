import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({
  path: ".env.local",
});

async function main() {
  const { prisma } = await import("../lib/prisma");

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required"
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
      name: "NEXTCORE Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },

    create: {
      name: "NEXTCORE Super Admin",
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ SUPER ADMIN created successfully");
  console.log("Email:", admin.email);
  console.log("Role:", admin.role);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("❌ CREATE ADMIN ERROR:", error);
  process.exit(1);
});