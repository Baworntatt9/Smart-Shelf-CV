"use client";

import { useState } from "react";

import UploadDropzone from "@/components/UploadDropzone";
import { analyzeShelf } from "@/lib/api";
import type { ShelfAnalysis } from "@/lib/types";

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShelfAnalysis | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      setResult(await analyzeShelf(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "วิเคราะห์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan text-ink shadow-lg">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3h4M3 3v4M21 3h-4M21 3v4M3 21h4M3 21v-4M21 21h-4M21 21v-4" />
            <rect x="8" y="8" width="8" height="8" rx="1.5" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">
            Smart Shelf
          </h1>
          <p className="text-sm text-muted">
            Planogram Compliance · อัปโหลดรูปชั้นวางเพื่อวิเคราะห์
          </p>
        </div>
      </header>

      <UploadDropzone onFile={handleFile} disabled={loading} />

      {preview && (
        <section className="overflow-hidden rounded-2xl border border-border bg-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="ชั้นวางที่อัปโหลด" className="w-full" />
        </section>
      )}

      {loading && (
        <p className="font-mono text-sm text-muted">กำลังวิเคราะห์ · running inference…</p>
      )}

      {error && (
        <p className="rounded-xl border border-bad/40 bg-bad/10 p-3 text-sm text-bad">
          {error}
        </p>
      )}

      {result && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Detected" value={`${result.detected}/${result.total}`} />
          <Stat label="Compliance" value={`${result.compliance_pct}%`} />
          <Stat label="Missing" value={result.missing} />
          <Stat label="Misplaced" value={result.misplaced} />
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-panel px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
