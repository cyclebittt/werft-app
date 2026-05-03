"use client";

import { motion } from "framer-motion";
import { TableCard } from "./TableCard";
import { useBilliardTables } from "@/lib/hooks/useBilliardTables";

interface TableGridProps {
  onTableClick: (tableId: number) => void;
  activeBookings?: Record<number, { startTime: string; endTime: string | null }>;
}

export function TableGrid({ onTableClick, activeBookings = {} }: TableGridProps) {
  const { tables, loading } = useBilliardTables();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {tables.map((table, i) => (
        <motion.div
          key={table.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <TableCard
            table={table}
            activeStartTime={activeBookings[table.id]?.startTime}
            activeEndTime={activeBookings[table.id]?.endTime}
            onClick={() => onTableClick(table.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}
