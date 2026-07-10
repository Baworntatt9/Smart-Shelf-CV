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

// SVG overlay drawn on top of the shelf image. Its viewBox matches the
// image's natural pixel size and it stretches to the rendered <img>, so
// detection boxes (pixel coords) map 1:1 regardless of display scaling.
export default function DetectionOverlay({
  detections,
  width,
  height,
  rows,
  show,
  conf,
}: Props) {
  if (!width || !height) return null;

  // Scale stroke / font to image size so they read at any resolution.
  const stroke = Math.max(width, height) * 0.0018;
  const font = Math.max(width, height) * 0.014;

  // Box colour by compliance: green = matches planogram, orange =
  // wrong product for its slot, cyan = detected but not on the grid.
  const colorFor = (status?: string | null) =>
    status === "correct"
      ? "#22c55e"
      : status === "misplaced"
        ? "#f5a623"
        : "#22d3ee";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
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
        // Below the chosen threshold the box is dropped from compliance;
        // show it dimmed + dashed rather than colouring it by status.
        const below = d.confidence < conf;
        const color = below ? "#8b96a8" : colorFor(d.status);
        const label = `${d.label} ${(d.confidence * 100).toFixed(0)}%`;
        return (
          <g key={i} opacity={below ? 0.5 : 1}>
            {show.boxes && (
              <rect
                x={d.box.x1}
                y={d.box.y1}
                width={w}
                height={h}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={below ? `${stroke * 2.5} ${stroke * 2}` : undefined}
                rx={stroke}
              />
            )}
            {show.labels && (
              <>
                <rect
                  x={d.box.x1}
                  y={Math.max(d.box.y1 - font * 1.35, 0)}
                  width={label.length * font * 0.58 + font * 0.5}
                  height={font * 1.3}
                  fill="#0b0e14"
                  opacity={0.78}
                  rx={stroke}
                />
                <text
                  x={d.box.x1 + font * 0.25}
                  y={Math.max(d.box.y1 - font * 0.4, font)}
                  fill={color}
                  fontSize={font}
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {label}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
