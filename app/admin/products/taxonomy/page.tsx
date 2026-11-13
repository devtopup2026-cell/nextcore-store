"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { TaxonomyEntry, TaxonomyKind } from "@/lib/catalog-taxonomy";

const empty = { name: "", slug: "", image: "", description: "", sortOrder: 0, visible: true };
const endpoint = "/api/catalog-taxonomy";
const input = "w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3";

export default function TaxonomyPage() {
  const [kind, setKind] = useState<TaxonomyKind>("categories");
  const [data, setData] = useState<{ categories: TaxonomyEntry[]; brands: TaxonomyEntry[] }>();
  const [form, setForm] = useState<TaxonomyEntry | typeof empty>(empty);
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint + "?admin", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("โหลดรายการไม่สำเร็จ");
        setData(await response.json());
      })
      .catch(() => { if (!controller.signal.aborted) setMessage("โหลดรายการไม่สำเร็จ"); });
    return () => controller.abort();
  }, [revision]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      let image = form.image || "";
      if (file) {
        const body = new FormData();
        body.set("file", file);
        const uploaded = await fetch("/api/admin/products/upload", { method: "POST", body });
        const result = await uploaded.json();
        if (!uploaded.ok || result.success !== true || typeof result.url !== "string") {
          throw new Error("อัปโหลดรูปไม่สำเร็จ");
        }
        image = result.url;
        setForm({ ...form, image });
        setFile(undefined);
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kind, image }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      setRevision((value) => value + 1);
      setForm(empty);
      setFile(undefined);
      setMessage("บันทึกแล้ว");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!("key" in form) || !window.confirm("?? " + form.name + "?")) return;
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, key: form.key, remove: true }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      setForm(empty);
      setFile(undefined);
      setRevision((value) => value + 1);
      setMessage("??????");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "???????????");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 text-white sm:p-8">
      <Link href="/admin/products" className="text-red-400">กลับไปจัดการสินค้า</Link>
      <h1 className="text-2xl font-bold">จัดการหมวดหมู่และแบรนด์</h1>
      <div className="flex gap-3">
        {(["categories", "brands"] as const).map((item) => (
          <button key={item} type="button" disabled={busy} aria-pressed={item === kind}
            className={item === kind ? "rounded-lg bg-red-700 p-3" : "rounded-lg bg-zinc-800 p-3"}
            onClick={() => { setKind(item); setForm(empty); setFile(undefined); setMessage(""); }}>
            {item === "categories" ? "หมวดหมู่" : "แบรนด์"}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <button type="button" disabled={busy} onClick={() => { setForm(empty); setFile(undefined); }} className="text-red-400">+ เพิ่มรายการ</button>
          {data?.[kind].map((entry) => (
            <button type="button" key={entry.key} disabled={busy} className="block w-full rounded-lg bg-zinc-900 p-3 text-left"
              onClick={() => { setForm(entry); setFile(undefined); }}>
              {entry.name} · {entry.visible ? "แสดง" : "ซ่อน"}
            </button>
          ))}
        </div>
        <form onSubmit={save} className="space-y-3">
          <fieldset disabled={busy} className="space-y-3">
            <label className="block">ชื่อ<input required value={form.name} className={input} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="block">Slug<input required value={form.slug} className={input} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
            {kind === "categories" && <>
              <label className="block">คำอธิบาย<textarea value={form.description ?? ""} className={input} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <label className="block">ลำดับ<input type="number" min="0" required value={form.sortOrder} className={input} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} /></label>
            </>}
            <label className="block">URL รูปหรือโลโก้<input value={form.image ?? ""} className={input} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label>
            <label className="block">อัปโหลดรูป<input key={kind + ("key" in form ? form.key : "") + revision} type="file" accept="image/jpeg,image/png,image/webp" className={input} onChange={(event) => setFile(event.target.files?.[0])} /></label>
            <label className="flex gap-2"><input type="checkbox" checked={form.visible} onChange={(event) => setForm({ ...form, visible: event.target.checked })} /> แสดงในหน้าร้าน</label>
            <button className="rounded-lg bg-red-700 px-5 py-3">{busy ? "กำลังบันทึก" : "บันทึก"}</button>
          </fieldset>
          {"key" in form && <button type="button" disabled={busy} onClick={remove} className="text-red-400">????????</button>}
          {message && <p role="status">{message}</p>}
        </form>
      </div>
    </main>
  );
}
