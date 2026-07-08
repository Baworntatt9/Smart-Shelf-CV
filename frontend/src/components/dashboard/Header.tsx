"use client";

import { LogoIcon, UploadIcon } from "@/components/icons";

interface Props {
  onUpload: () => void;
  disabled?: boolean;
}

export default function Header({ onUpload, disabled }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-cyan text-ink shadow-lg shadow-accent/35">
          <LogoIcon />
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
          onClick={onUpload}
          disabled={disabled}
          className="cursor-pointer inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-accent to-cyan px-4 py-2.5 text-[13px] font-semibold text-[#08111f] shadow-lg shadow-accent/30 transition hover:brightness-105 disabled:opacity-50"
        >
          <UploadIcon size={16} />
          อัปโหลดรูปชั้นวาง
        </button>
      </div>
    </header>
  );
}
