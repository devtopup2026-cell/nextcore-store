"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("ไม่สามารถเข้าสู่ระบบได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-black tracking-wider text-red-500">
              NEXTCORE
            </h1>

            <p className="mt-3 text-zinc-400">
              Admin Control Center
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">

            <h2 className="mb-2 text-3xl font-bold">
              Admin Login
            </h2>

            <p className="mb-8 text-sm text-zinc-400">
              Sign in to manage NEXTCORE
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="admin@nextcore.com"
                  autoComplete="username"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-zinc-700
                    bg-zinc-800
                    px-4
                    py-4
                    outline-none
                    transition
                    focus:border-red-500
                  "
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-zinc-700
                    bg-zinc-800
                    px-4
                    py-4
                    outline-none
                    transition
                    focus:border-red-500
                  "
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  bg-red-600
                  py-4
                  text-lg
                  font-bold
                  transition
                  hover:bg-red-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>

            </form>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            NEXTCORE Administration System
          </p>

        </div>
      </div>
    </main>
  );
}