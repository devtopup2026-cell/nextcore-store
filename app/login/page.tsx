"use client";
import { Text, LanguageToggle, useLanguage } from "@/app/i18n/language";


import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { translate } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");

    try {
      setLoading(true);

      const response = await fetch("/api/customer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      router.push("/account");
      router.refresh();
    } catch (error) {
      console.error("LOGIN_ERROR:", error);

      setError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-12 text-white">
      <div className="fixed right-4 top-4 z-40"><LanguageToggle /></div>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-wider"
          >
            NEXT<span className="text-red-600">CORE</span>
          </Link>

          <h1 className="mt-6 text-2xl font-bold">
            <Text>{"Login"}</Text>
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            <Text>{"เข้าสู่ระบบสมาชิก NEXTCORE"}</Text>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Text>{"Email"}</Text>
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                <Text>{"Password"}</Text>
              </label>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={translate("Password")}
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-red-600 px-4 py-3 font-bold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Text>{"Logging in..."}</Text> : <Text>{"Login"}</Text>}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-400">
            <Text>{"ยังไม่มีบัญชี?"}</Text>{" "}
            <Link
              href="/register"
              className="font-medium text-red-500 hover:text-red-400"
            >
              <Text>{"Create Account"}</Text>
            </Link>
          </p>

          <div className="mt-6 border-t border-zinc-800 pt-6 text-center">
            <Link
              href="/"
              className="text-sm text-zinc-500 transition hover:text-white"
            >
              <Text>{"← กลับหน้าร้าน"}</Text>
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}