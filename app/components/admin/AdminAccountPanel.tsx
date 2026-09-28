"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLogoutButton from "./AdminLogoutButton";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminAccountPanel() {
  const router = useRouter();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          return;
        }

        setAdmin(data.admin);
      } catch (error) {
        console.error("LOAD ADMIN ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-zinc-500">
        Loading admin...
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const isSuperAdmin =
    admin.role === "SUPER_ADMIN";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <p className="text-sm text-zinc-400">
          Logged in as
        </p>

        <p className="mt-1 text-lg font-bold">
          {admin.name}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">

          <span
            className={`
              rounded-lg
              px-3
              py-1
              text-xs
              font-bold
              ${
                isSuperAdmin
                  ? "bg-red-600 text-white"
                  : "bg-zinc-700 text-zinc-200"
              }
            `}
          >
            {admin.role}
          </span>

          <span className="text-sm text-zinc-500">
            {admin.email}
          </span>

        </div>
      </div>


      <div className="flex flex-wrap gap-3">

  <button
    type="button"
    onClick={() => router.push("/admin")}
    className="
      rounded-xl
      border
      border-zinc-700
      bg-zinc-800
      px-5
      py-3
      font-bold
      text-white
      transition
      hover:border-red-500
      hover:text-red-500
    "
  >
    Dashboard
  </button>

  <button
    type="button"
    onClick={() => router.push("/admin/products")}
    className="
      rounded-xl
      border
      border-zinc-700
      bg-zinc-800
      px-5
      py-3
      font-bold
      text-white
      transition
      hover:border-red-500
      hover:text-red-500
    "
  >
    Products
  </button>

  {isSuperAdmin && (
    <button
      type="button"
      onClick={() => router.push("/admin/order-manager")}
      className="
        rounded-xl
        bg-red-600
        px-5
        py-3
        font-bold
        text-white
        transition
        hover:bg-red-500
      "
    >
      Order Manager
    </button>
  )}

  <button
    type="button"
    onClick={() => router.push("/")}
    className="
      rounded-xl
      border
      border-zinc-700
      bg-zinc-800
      px-5
      py-3
      font-bold
      text-white
      transition
      hover:border-red-500
      hover:text-red-500
    "
  >
    View Store
  </button>

  <AdminLogoutButton />

</div>

      </div>

    
  );
}