"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Text, useLanguage } from "@/app/i18n/language";

export default function OrderSlipForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const inputId = useId();
  const { translate } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [attached, setAttached] = useState(false);
  const [error, setError] = useState("");

  async function attach(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || attached) return;

    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) {
      setError("Choose an image up to 5 MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const response = await fetch(`/api/customer/orders/${encodeURIComponent(orderId)}/slip`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "Could not attach the slip. Please try again.");
      }

      setAttached(true);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not attach the slip. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (attached) {
    return <p role="status" className="mt-4 text-sm text-green-400"><Text>{"Payment slip attached"}</Text></p>;
  }

  return (
    <form onSubmit={attach} className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
      <label htmlFor={inputId} className="block text-sm font-semibold">
        <Text>{"Attach payment slip"}</Text>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          id={inputId}
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={uploading}
          className="w-full max-w-xs rounded-lg border border-zinc-700 p-2 text-sm"
        />
        <button type="submit" disabled={uploading} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-700 disabled:opacity-50">
          <Text>{uploading ? "Uploading slip..." : "Upload slip"}</Text>
        </button>
      </div>
      <p className="text-xs text-zinc-400"><Text>{"JPG, PNG or WEBP — maximum 5 MB"}</Text></p>
      {error && <p role="alert" className="text-sm text-red-400">{translate(error)}</p>}
    </form>
  );
}
