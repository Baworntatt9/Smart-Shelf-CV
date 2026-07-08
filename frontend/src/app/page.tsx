"use client";

import { useRef, useState } from "react";

import { analyzeShelf } from "@/lib/api";
import type { ShelfAnalysis, SlotStatus } from "@/lib/types";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShelfAnalysis | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      setError("รองรับเฉพาะไฟล์ JPEG / PNG / WebP");
      return;
    }
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
    <main className="flex w-full flex-col gap-[18px] px-6 pb-8 pt-5">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-cyan text-ink shadow-lg shadow-accent/35">
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
            <h1 className="font-display text-xl font-bold leading-none tracking-tight">
              Smart&nbsp;Shelf
            </h1>
            <p className="mt-1 text-[12.5px] text-muted">
              Planogram Compliance · Computer Vision Demo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-panel px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-ok shadow-[0_0_0_3px_rgba(34,197,94,0.18)]" />
            <span className="font-mono text-[12.5px] text-[#b9c2d0]">YOLOv8n</span>
            <span className="h-3 w-px bg-[#2b3543]" />
            <span className="font-mono text-[12.5px] text-muted">
              mAP <b className="text-fg">—</b>
            </span>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-accent to-cyan px-4 py-2.5 text-[13px] font-semibold text-[#08111f] shadow-lg shadow-accent/30 transition hover:brightness-105 disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 16V4M12 4l-5 5M12 4l5 5" />
              <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
            </svg>
            อัปโหลดรูปชั้นวาง
          </button>
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-bad/40 bg-bad/10 p-3 text-sm text-bad">
          {error}
        </p>
      )}

      {/* MAIN */}
      <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.75fr)_minmax(360px,0.92fr)]">
        {/* LEFT: VIEWER */}
        <section className="flex min-w-0 flex-col gap-3">
          {/* toolbar (scaffold until data drives it) */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 rounded-xl border border-border bg-panel-2 px-3 py-2.5">
            <div className="flex items-center gap-2">
              {["Boxes", "Grid", "Labels"].map((t) => (
                <span
                  key={t}
                  className="rounded-lg border border-[#2a3442] px-2.5 py-1.5 font-mono text-[11.5px] text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* viewer */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => !loading && inputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !loading)
                inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!loading) handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-b from-[#1b232f] via-[#131a24] to-[#0d131b] transition
              ${dragging ? "border-accent" : "border-border"}`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="ชั้นวางที่อัปโหลด"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                >
                  <path d="M12 16V4M12 4l-5 5M12 4l5 5" />
                  <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
                </svg>
                <div className="text-sm font-medium">
                  ลากรูปชั้นวางมาวาง หรือ คลิกเพื่อเลือกไฟล์
                </div>
                <div className="text-xs text-muted">
                  JPEG · PNG · WebP · สูงสุด 10 MB
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[rgba(8,11,17,0.66)] backdrop-blur-sm">
                <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-accent/25 border-t-accent" />
                <div className="font-mono text-[13px] tracking-[0.4px] text-[#b9c2d0]">
                  กำลังวิเคราะห์ · running inference…
                </div>
              </div>
            )}
          </div>

          {/* legend */}
          <div className="flex flex-wrap items-center gap-[18px] px-1 py-0.5 text-[12.5px] text-[#9aa5b4]">
            <LegendItem color="bg-ok" label="ตรงตาม planogram" />
            <LegendItem color="bg-warn" label="ผิดตำแหน่ง (Misplaced)" />
            <LegendItem color="bg-bad" label="ขาด / Stock-out" />
          </div>
        </section>

        {/* RIGHT: ANALYSIS */}
        <aside className="flex min-w-0 flex-col gap-3.5">
          {/* metrics */}
          <div className="grid grid-cols-2 gap-[11px]">
            <Metric
              label="Detected"
              value={result ? `${result.detected}` : "—"}
              suffix={result ? ` / ${result.total}` : " / —"}
              hint="สินค้าที่ตรวจพบ"
            />
            <Metric
              label="Compliance"
              value={result ? `${result.compliance_pct}` : "—"}
              suffix={result ? "%" : ""}
              hint={result ? undefined : "รออัปโหลด"}
              accentValue
            />
            <Metric
              label="Issues"
              value={result ? `${result.missing + result.misplaced}` : "—"}
              hint={
                result
                  ? `ขาด ${result.missing} · ผิดตำแหน่ง ${result.misplaced}`
                  : "ขาด — · ผิดตำแหน่ง —"
              }
            />
            <Metric
              label="Conf. threshold"
              value="0.50"
              mono
              hint="ค่าเริ่มต้น"
            />
          </div>

          {/* planogram grid */}
          <Panel
            title="Planogram Grid"
            meta="3 × 6 · เทียบแผนผัง"
          >
            <div className="grid grid-cols-6 gap-1.5">
              {(result?.slots ?? Array.from({ length: 18 })).map((slot, i) => (
                <GridCell
                  key={i}
                  status={
                    (slot as { status?: SlotStatus } | undefined)?.status
                  }
                  code={(slot as { expected?: string } | undefined)?.expected}
                />
              ))}
            </div>
          </Panel>

          {/* issues list */}
          <Panel
            title="ปัญหาที่ตรวจพบ"
            badge={result ? `${result.missing + result.misplaced}` : undefined}
          >
            {result ? (
              result.slots.filter((s) => s.status !== "correct").length ? (
                <div className="flex max-h-[236px] flex-col gap-2 overflow-auto">
                  {result.slots
                    .filter((s) => s.status !== "correct")
                    .map((s, i) => (
                      <IssueRow key={i} slot={s} />
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 py-6 text-ok">
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
                  </svg>
                  <div className="text-[13.5px] text-[#b9c2d0]">
                    ชั้นวางตรงตาม planogram ทั้งหมด
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[50px] w-full rounded-[9px]" />
                ))}
                <p className="pt-1 text-center text-xs text-muted">
                  อัปโหลดรูปเพื่อดูปัญหาที่ตรวจพบ
                </p>
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </main>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-[3px] ${color}`} />
      {label}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-border/60 ${className}`} />;
}

function Metric({
  label,
  value,
  suffix,
  hint,
  mono,
  accentValue,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  mono?: boolean;
  accentValue?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel px-4 py-3.5">
      <div className="text-[11px] uppercase tracking-[0.6px] text-muted">
        {label}
      </div>
      <div
        className={`mt-1.5 text-[27px] font-bold leading-tight ${
          mono ? "font-mono text-2xl" : "font-display"
        } ${accentValue && value !== "—" ? "text-ok" : ""}`}
      >
        {value}
        {suffix && (
          <span className="text-[15px] font-medium text-muted">{suffix}</span>
        )}
      </div>
      {hint && <div className="mt-1 text-[11.5px] text-muted">{hint}</div>}
    </div>
  );
}

function Panel({
  title,
  meta,
  badge,
  children,
}: {
  title: string;
  meta?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-[14.5px] font-semibold">{title}</div>
        {meta && (
          <div className="font-mono text-[11.5px] text-muted">{meta}</div>
        )}
        {badge && (
          <span className="rounded-full bg-bad/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-bad">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const STATUS_STYLE: Record<SlotStatus, { ring: string; icon: string; tone: string }> = {
  correct: { ring: "border-ok/60 bg-ok/15", icon: "✓", tone: "text-ok" },
  misplaced: { ring: "border-warn/60 bg-warn/15", icon: "⇄", tone: "text-warn" },
  missing: { ring: "border-bad/60 bg-bad/15", icon: "✕", tone: "text-bad" },
};

function GridCell({ status, code }: { status?: SlotStatus; code?: string }) {
  if (!status) {
    return <div className="aspect-square animate-pulse rounded-lg bg-border/40" />;
  }
  const s = STATUS_STYLE[status];
  return (
    <div
      className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border ${s.ring}`}
    >
      <span className="font-mono text-[11px] font-semibold text-[#d5dce6]">
        {code}
      </span>
      <span className={`text-xs font-bold leading-none ${s.tone}`}>
        {s.icon}
      </span>
    </div>
  );
}

function IssueRow({
  slot,
}: {
  slot: {
    row: number;
    col: number;
    expected: string;
    detected?: string | null;
    status: SlotStatus;
  };
}) {
  const isMissing = slot.status === "missing";
  const s = STATUS_STYLE[slot.status];
  return (
    <div className="flex items-center gap-2.5 rounded-[9px] border border-border bg-[#10151d] px-2.5 py-2">
      <div
        className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg text-sm font-bold ${s.tone} bg-current/10`}
      >
        <span className={s.tone}>{isMissing ? "✕" : "⇄"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-fg">
          {isMissing
            ? `สินค้าขาด · ${slot.expected}`
            : `ผิดตำแหน่ง · ${slot.expected}`}
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {isMissing
            ? `ควรมี ${slot.expected} แต่ตรวจไม่พบ`
            : `คาดว่า ${slot.expected} แต่พบ ${slot.detected}`}
        </div>
      </div>
      <div className="whitespace-nowrap text-right font-mono text-[11.5px] text-muted">
        R{slot.row + 1}·C{slot.col + 1}
      </div>
    </div>
  );
}
