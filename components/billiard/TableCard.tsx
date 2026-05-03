"use client";

import { motion } from "framer-motion";
import { Timer } from "@/components/ui/Timer";
import type { BilliardTable } from "@/lib/hooks/useBilliardTables";

interface TableCardProps {
  table: BilliardTable;
  activeEndTime?: string | null;
  activeStartTime?: string | null;
  onClick: () => void;
}

const statusConfig = {
  free: {
    dot: "bg-[var(--color-success)]",
    label: "Frei",
    border: "hover:border-[var(--color-success)]",
    bg: "",
  },
  occupied: {
    dot: "bg-[var(--color-danger)]",
    label: "Belegt",
    border: "hover:border-[var(--color-danger)]",
    bg: "",
  },
  reserved: {
    dot: "bg-[var(--color-warning)]",
    label: "Reserviert",
    border: "hover:border-[var(--color-warning)]",
    bg: "",
  },
};

export function TableCard({ table, activeEndTime, activeStartTime, onClick }: TableCardProps) {
  const cfg = statusConfig[table.status];

  return (
    <motion.div
      layout
      animate={{ backgroundColor: table.status === "occupied" ? "#1a0f0f" : table.status === "reserved" ? "#1a1600" : "#141414" }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={[
        "border border-[var(--color-border)] rounded-[2px] p-5 cursor-pointer",
        "transition-[border-color] duration-150",
        cfg.border,
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-3xl font-bold text-[var(--color-text)]">
          {String(table.id).padStart(2, "0")}
        </span>
        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${cfg.dot} shadow-sm`} aria-label={cfg.label} />
      </div>

      <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">
        {cfg.label}
      </div>

      {table.status === "occupied" && activeStartTime && (
        <div className="text-[var(--color-danger)] font-mono text-sm">
          <Timer startTime={activeStartTime} />
        </div>
      )}

      {table.status === "free" && (
        <div className="text-[var(--color-success)] text-xs">Jetzt buchen →</div>
      )}

      {table.status === "reserved" && (
        <div className="text-[var(--color-warning)] text-xs">Reserviert</div>
      )}
    </motion.div>
  );
}
