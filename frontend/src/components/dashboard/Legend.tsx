const ITEMS = [
  { swatch: "bg-ok", label: "ตรงตาม planogram" },
  { swatch: "bg-warn", label: "ผิดตำแหน่ง (Misplaced)" },
  { swatch: "bg-bad", label: "ขาด / Stock-out" },
];

export default function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-[18px] px-1 py-0.5 text-[12.5px] text-[#9aa5b4]">
      {ITEMS.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-[3px] ${it.swatch}`} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
