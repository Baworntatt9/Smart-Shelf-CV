"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export default function UploadDropzone({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPT.includes(file.type)) {
        setError("รองรับเฉพาะไฟล์ JPEG / PNG / WebP");
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled)
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
          if (!disabled) pick(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition
          ${dragging ? "border-accent bg-accent/10" : "border-border bg-panel/40 hover:border-accent/60"}
          ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
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
        <div className="text-xs text-muted">JPEG · PNG · WebP · สูงสุด 10 MB</div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      {error && <p className="mt-2 text-sm text-bad">{error}</p>}
    </div>
  );
}
