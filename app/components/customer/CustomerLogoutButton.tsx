"use client";
import { Text } from "@/app/i18n/language";


import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch("/api/customer/logout", {
        method: "POST",
      });

      if (!response.ok) {
        alert("ไม่สามารถออกจากระบบได้");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("CUSTOMER_LOGOUT_ERROR:", error);
      alert("ไม่สามารถออกจากระบบได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Text>{"Logging out..."}</Text> : <Text>{"Logout"}</Text>}
    </button>
  );
}