"use client";

import { useState } from "react";

import { UploadIcon } from "@/components/icons";
import DetectionOverlay, {
  type OverlayToggles,
} from "@/components/dashboard/DetectionOverlay";
import type { ShelfAnalysis } from "@/lib/types";

interface Props {
  preview: string | null;
  loading: boolean;
  result: ShelfAnalysis | null;
  show: OverlayToggles;
  onPick: () => void;
  onFile: (file: File | undefined) => void;
}

export default function ShelfViewer({
  preview,
  loading,
  result,
  show,
  onPick,
  onFile,
}: Props) {
  const [dragging, setDragging] = useState(false);
  // Natural pixel size of the loaded image = the size detections are in.
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);

  const rows = result ? Math.max(...result.slots.map((s) => s.row)) + 1 : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !loading && onPick()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !loading) onPick();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!loading) onFile(e.dataTransfer.files?.[0]);
      }}
      className={`relative w-full cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-b from-[#1b232f] via-[#131a24] to-[#0d131b] transition
        ${preview ? "" : "aspect-[16/10]"}
        ${dragging ? "border-accent" : "border-border"}`}
    >
      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="ชั้นวางที่อัปโหลด"
            onLoad={(e) =>
              setDim({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              })
            }
            className="block h-auto w-full"
          />
          {result && dim && (
            <DetectionOverlay
              detections={result.detections}
              width={dim.w}
              height={dim.h}
              rows={rows}
              show={show}
            />
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <UploadIcon size={34} className="text-accent" />
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
  );
}
