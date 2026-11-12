"use client";
import { Text, LanguageToggle, useLanguage } from "@/app/i18n/language";


import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { translate } = useLanguage();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password และ Confirm Password ไม่ตรงกัน");
      return;
    }

    if (form.password.length < 8) {
      setError("Password ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/customer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          address: form.address,
          postalCode: form.postalCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      alert("สมัครสมาชิกสำเร็จ");

      router.push("/login");
    } catch (error) {
      console.error("REGISTER_ERROR:", error);

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
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-wider"
          >
            NEXT<span className="text-red-600">CORE</span>
          </Link>

          <h1 className="mt-6 text-2xl font-bold">
            <Text>{"Create Account"}</Text>
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            <Text>{"สมัครสมาชิก NEXTCORE"}</Text>
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
                <Text>{"ชื่อ-นามสกุล"}</Text>
              </label>

              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) =>
                  updateField("fullName", e.target.value)
                }
                placeholder={translate("ชื่อ-นามสกุล")}
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                <Text>{"Email"}</Text>
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                placeholder="example@email.com"
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  <Text>{"Password"}</Text>
                </label>

                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    updateField("password", e.target.value)
                  }
                  placeholder={translate("อย่างน้อย 8 ตัวอักษร")}
                  className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  <Text>{"Confirm Password"}</Text>
                </label>

                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField(
                      "confirmPassword",
                      e.target.value
                    )
                  }
                  placeholder={translate("ยืนยัน Password")}
                  className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                <Text>{"เบอร์โทรศัพท์"}</Text>
              </label>

              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                placeholder="08xxxxxxxx"
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                <Text>{"ที่อยู่"}</Text>
              </label>

              <textarea
                required
                rows={4}
                value={form.address}
                onChange={(e) =>
                  updateField("address", e.target.value)
                }
                placeholder={translate("ที่อยู่สำหรับจัดส่งสินค้า")}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                <Text>{"รหัสไปรษณีย์"}</Text>
              </label>

              <input
                type="text"
                required
                value={form.postalCode}
                onChange={(e) =>
                  updateField("postalCode", e.target.value)
                }
                placeholder="10100"
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-red-600 px-4 py-3 font-bold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Text>{"Creating Account..."}</Text> : <Text>{"Create Account"}</Text>}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-400">
            <Text>{"มีบัญชีอยู่แล้ว?"}</Text>{" "}
            <Link
              href="/login"
              className="font-medium text-red-500 hover:text-red-400"
            >
              <Text>{"Login"}</Text>
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}