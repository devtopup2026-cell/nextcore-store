import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const CUSTOMER_SESSION_COOKIE = "nextcore_customer_session";

export async function createCustomerSession(customerId: string) {
  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_SESSION_COOKIE, customerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getCustomerSession() {
  const cookieStore = await cookies();

  const customerId = cookieStore.get(
    CUSTOMER_SESSION_COOKIE
  )?.value;

  if (!customerId) {
    return null;
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      address: true,
      postalCode: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return customer;
}

export async function deleteCustomerSession() {
  const cookieStore = await cookies();

  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}