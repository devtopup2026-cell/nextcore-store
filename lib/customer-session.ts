import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const CUSTOMER_SESSION_COOKIE = "nextcore_customer_session";
const sessionLifetime = 60 * 60 * 24 * 30;

function signSession(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");

  return createHmac("sha256", secret)
    .update("nextcore:customer-session:")
    .update(payload)
    .digest("base64url");
}

function readCustomerId(token: string) {
  const [customerId, expiresAt, signature, extra] = token.split(".");
  if (!customerId || !expiresAt || !signature || extra !== undefined) return null;
  const expiration = Number(expiresAt);
  if (!Number.isSafeInteger(expiration) || expiration <= Date.now()) return null;

  const expected = Buffer.from(signSession(`${customerId}.${expiresAt}`));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected)
    ? customerId
    : null;
}

export async function createCustomerSession(customerId: string) {
  const cookieStore = await cookies();

  const payload = `${customerId}.${Date.now() + sessionLifetime * 1000}`;
  cookieStore.set(CUSTOMER_SESSION_COOKIE, `${payload}.${signSession(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetime,
  });
}

export async function getCustomerSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    CUSTOMER_SESSION_COOKIE
  )?.value;

  const customerId = token ? readCustomerId(token) : null;

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