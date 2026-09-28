"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

useEffect(() => {
  const loadAdmin = async () => {
    try {
      const res = await fetch("/api/admin/me", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok && data.success && data.admin) {
        setRole(data.admin.role);
      } else {
        setRole(null);
      }
    } catch {
      setRole(null);
    }
  };

  loadAdmin();
}, []);

const isSuperAdmin = role === "SUPER_ADMIN";


  const buttonClass = (active: boolean) =>
    `
      rounded-xl
      border
      px-5
      py-3
      text-sm
      font-bold
      transition
      ${
        active
          ? "border-red-600 bg-red-600 text-white"
          : "border-zinc-700 bg-zinc-800 text-white hover:border-red-500 hover:text-red-500"
      }
    `;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => router.push("/admin")}
        className={buttonClass(pathname === "/admin")}
      >
        Dashboard
      </button>

      <button
        type="button"
        onClick={() => router.push("/admin/products")}
        className={buttonClass(
          pathname.startsWith("/admin/products")
        )}
      >
        Products
      </button>

        {isSuperAdmin && (
  <button
    type="button"
    onClick={() => router.push("/admin/order-manager")}
    className={buttonClass(
      pathname.startsWith("/admin/order-manager")
    )}
  >
    Order Manager
  </button>
)}


      <button
        type="button"
        onClick={() => router.push("/")}
        className={buttonClass(false)}
      >
        View Store
      </button>
    </div>
  );
}