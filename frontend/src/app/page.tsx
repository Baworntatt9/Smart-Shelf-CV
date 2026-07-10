"use client";

import { useRef, useState } from "react";

import Skeleton from "@/components/Skeleton";
import { CheckCircleIcon } from "@/components/icons";
import GridCell from "@/components/dashboard/GridCell";
import Header from "@/components/dashboard/Header";
import IssueRow from "@/components/dashboard/IssueRow";
import Legend from "@/components/dashboard/Legend";
import Metric from "@/components/dashboard/Metric";
import Panel from "@/components/dashboard/Panel";
import ShelfViewer from "@/components/dashboard/ShelfViewer";
import { analyzeShelf } from "@/lib/api";
import type { ShelfAnalysis } from "@/lib/types";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShelfAnalysis | null>(null);
  const [show, setShow] = useState({ boxes: true, grid: false, labels: false });

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

  const issues = result?.slots.filter((s) => s.status !== "correct") ?? [];
  const issueCount = result ? result.missing + result.misplaced : 0;

  // Group slots into rows for the heatmap (rows have varying column counts).
  const gridRows = result
    ? Object.values(
        result.slots.reduce<Record<number, typeof result.slots>>((acc, s) => {
          (acc[s.row] ??= []).push(s);
          return acc;
        }, {})
      )
        .sort((a, b) => a[0].row - b[0].row)
        .map((row) => [...row].sort((a, b) => a.col - b.col))
    : null;

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

      <Header onUpload={() => inputRef.current?.click()} disabled={loading} />

      {error && (
        <p className="rounded-xl border border-bad/40 bg-bad/10 p-3 text-sm text-bad">
          {error}
        </p>
      )}

      <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.75fr)_minmax(360px,0.92fr)]">
        {/* LEFT: VIEWER */}
        <section className="flex min-w-0 flex-col gap-3">
          {/* toolbar — overlay toggles (disabled until a result exists) */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 rounded-xl border border-border bg-panel-2 px-3 py-2.5">
            <div className="flex items-center gap-2">
              {(["boxes", "grid", "labels"] as const).map((k) => {
                const active = show[k];
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={!result}
                    onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
                    className={`rounded-lg border px-2.5 py-1.5 font-mono text-[11.5px] capitalize transition disabled:cursor-not-allowed disabled:opacity-40
                      ${
                        active
                          ? "border-cyan/60 bg-cyan/15 text-cyan"
                          : "cursor-pointer border-[#2a3442] text-muted hover:text-fg"
                      }`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          </div>

          <ShelfViewer
            preview={preview}
            loading={loading}
            result={result}
            show={show}
            onPick={() => inputRef.current?.click()}
            onFile={handleFile}
          />

          <Legend />
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
              value={result ? `${issueCount}` : "—"}
              hint={
                result
                  ? `ขาด ${result.missing} · ผิดตำแหน่ง ${result.misplaced}`
                  : "ขาด — · ผิดตำแหน่ง —"
              }
            />
            <Metric label="Conf. threshold" value="0.25" mono hint="ค่าเริ่มต้น" />
          </div>

          {/* planogram grid */}
          <Panel
            title="Planogram Grid"
            meta={
              gridRows
                ? `${gridRows.length} แถว · ${result!.total} ช่อง`
                : "เทียบแผนผัง"
            }
          >
            <div className="flex flex-col gap-1">
              {gridRows
                ? gridRows.map((row, r) => (
                    <div key={r} className="flex gap-1">
                      {row.map((slot) => (
                        <GridCell
                          key={slot.col}
                          status={slot.status}
                          title={`R${slot.row + 1}·C${slot.col + 1} · ${slot.expected}${
                            slot.detected && slot.detected !== slot.expected
                              ? ` → ${slot.detected}`
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                  ))
                : Array.from({ length: 3 }).map((_, r) => (
                    <div key={r} className="flex gap-1">
                      {Array.from({ length: 12 }).map((_, c) => (
                        <GridCell key={c} />
                      ))}
                    </div>
                  ))}
            </div>
          </Panel>

          {/* issues list */}
          <Panel
            title="ปัญหาที่ตรวจพบ"
            badge={result ? `${issueCount}` : undefined}
          >
            {result ? (
              issues.length ? (
                <div className="flex max-h-[236px] flex-col gap-2 overflow-auto">
                  {issues.map((s, i) => (
                    <IssueRow key={i} slot={s} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 py-6 text-ok">
                  <CheckCircleIcon />
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
