"use client";

import { useState } from "react";

import type { Detection } from "@/lib/types";

export interface OverlayToggles {
  boxes: boolean;
  grid: boolean;
  labels: boolean;
}

interface Props {
  detections: Detection[];
  width: number; // natural pixel dims of the analyzed image
  height: number;
  rows: number; // planogram row count, for the grid guide lines
  show: OverlayToggles;
  conf: number; // boxes below this are dimmed as "below threshold"
}

// Box colour by compliance: green = matches planogram, orange =
// wrong product for its slot, cyan = detected but not on the grid.
const colorFor = (status?: string | null) =>
  status === "correct"
    ? "#22c55e"
    : status === "misplaced"
      ? "#f5a623"
      : "#22d3ee";

// SVG overlay drawn on top of the shelf image. Its viewBox matches the
// image's natural pixel size and it stretches to the rendered <img>, so
// detection boxes (pixel coords) map 1:1 regardless of display scaling.
//
// Labels overlap badly on dense shelves, so by default only boxes are
// drawn; hovering a box lifts it (bright + thick, others dimmed) and
// shows a single clean label chip. The "Labels" toggle still renders
// every label at once when explicitly requested.
export default function DetectionOverlay({
  detections,
  width,
  height,
  rows,
  show,
  conf,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);

  if (!width || !height) return null;

  // Scale stroke / font to image size so they read at any resolution.
  const stroke = Math.max(width, height) * 0.0018;
  const font = Math.max(width, height) * 0.014;
  const anyHover = hover !== null;

  // A single label chip (bg rect + text), clamped inside the image.
  const labelChip = (d: Detection, color: string, emphasis = false) => {
    const text = `${d.label} ${(d.confidence * 100).toFixed(0)}%`;
    const fs = emphasis ? font * 1.15 : font;
    const w = text.length * fs * 0.58 + fs * 0.5;
    const x = Math.min(d.box.x1, width - w);
    const above = d.box.y1 - fs * 1.35 >= 0;
    const y = above ? d.box.y1 - fs * 1.3 : d.box.y2 + fs * 0.1;
    return (
      <>
        <rect
          x={x}
          y={y}
          width={w}
          height={fs * 1.25}
          fill="#0b0e14"
          opacity={emphasis ? 0.92 : 0.78}
          rx={stroke}
        />
        <text
          x={x + fs * 0.28}
          y={y + fs * 0.95}
          fill={color}
          fontSize={fs}
          fontFamily="monospace"
          fontWeight="700"
        >
          {text}
        </text>
      </>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      // none on the root lets clicks fall through to the dropzone; the
      // per-box hit rects re-enable pointer events for hover.
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {show.grid &&
        Array.from({ length: Math.max(rows - 1, 0) }).map((_, i) => {
          const y = (height / rows) * (i + 1);
          return (
            <line
              key={`g${i}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#4f7dff"
              strokeWidth={stroke}
              strokeDasharray={`${stroke * 4} ${stroke * 3}`}
              opacity={0.5}
            />
          );
        })}

      {detections.map((d, i) => {
        const w = d.box.x2 - d.box.x1;
        const h = d.box.y2 - d.box.y1;
        const below = d.confidence < conf;
        const color = below ? "#8b96a8" : colorFor(d.status);
        const isHover = hover === i;
        // Dim everything except the hovered box so it stands out.
        const opacity = isHover ? 1 : anyHover ? 0.28 : below ? 0.5 : 1;
        return (
          <g key={i} opacity={opacity}>
            {show.boxes && (
              <rect
                x={d.box.x1}
                y={d.box.y1}
                width={w}
                height={h}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={
                  below ? `${stroke * 2.5} ${stroke * 2}` : undefined
                }
                rx={stroke}
              />
            )}
            {show.labels && !anyHover && labelChip(d, color)}
            {/* transparent hit target — re-enables pointer events */}
            <rect
              x={d.box.x1}
              y={d.box.y1}
              width={w}
              height={h}
              fill="transparent"
              className="pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((cur) => (cur === i ? null : cur))}
            />
          </g>
        );
      })}

      {/* Hovered box redrawn on top: bright, thick, with its label chip. */}
      {hover !== null &&
        (() => {
          const d = detections[hover];
          const below = d.confidence < conf;
          const color = below ? "#8b96a8" : colorFor(d.status);
          return (
            <g className="pointer-events-none">
              <rect
                x={d.box.x1}
                y={d.box.y1}
                width={d.box.x2 - d.box.x1}
                height={d.box.y2 - d.box.y1}
                fill={color}
                fillOpacity={0.12}
                stroke={color}
                strokeWidth={stroke * 2.4}
                rx={stroke}
              />
              {labelChip(d, color, true)}
            </g>
          );
        })()}
    </svg>
  );
}
