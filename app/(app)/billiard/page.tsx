"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Circle, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { CheckCircle } from "lucide-react";

type TableStatus = "free" | "occupied" | "reserved";

interface TableData {
  id: number;
  status: TableStatus;
  startTime?: string; // ISO string wenn belegt
}

// Mock-Initialdaten für Demo
const MOCK_TABLES: TableData[] = [
  { id: 1, status: "free" },
  { id: 2, status: "occupied", startTime: new Date(Date.now() - 42 * 60 * 1000).toISOString() },
  { id: 3, status: "free" },
  { id: 4, status: "reserved" },
  { id: 5, status: "free" },
  { id: 6, status: "occupied", startTime: new Date(Date.now() - 11 * 60 * 1000).toISOString() },
];

const statusConfig = {
  free: {
    dot: "bg-[var(--color-success)] shadow-[0_0_6px_var(--color-success)]",
    label: "Frei",
    labelColor: "text-[var(--color-success)]",
    border: "hover:border-[var(--color-success)]",
    bg: "hover:bg-green-950/30",
  },
  occupied: {
    dot: "bg-[var(--color-danger)] shadow-[0_0_6px_var(--color-danger)]",
    label: "Belegt",
    labelColor: "text-[var(--color-danger)]",
    border: "hover:border-[var(--color-danger)]",
    bg: "hover:bg-red-950/30",
  },
  reserved: {
    dot: "bg-[var(--color-warning)] shadow-[0_0_6px_var(--color-warning)]",
    label: "Reserviert",
    labelColor: "text-[var(--color-warning)]",
    border: "hover:border-[var(--color-warning)]",
    bg: "",
  },
};

function TableCard({ table, onClick }: { table: TableData; onClick: () => void }) {
  const cfg = statusConfig[table.status];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={table.status !== "reserved" ? onClick : undefined}
      className={[
        "border border-[var(--color-border)] rounded-[2px] p-5",
        "transition-all duration-200 bg-[var(--color-surface)]",
        table.status !== "reserved" ? `cursor-pointer ${cfg.border} ${cfg.bg}` : "cursor-default opacity-70",
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-4xl font-bold text-[var(--color-text)] leading-none">
          {String(table.id).padStart(2, "0")}
        </span>
        <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${cfg.dot}`} />
      </div>

      <div className={`text-xs font-medium uppercase tracking-wider mb-2 ${cfg.labelColor}`}>
        {cfg.label}
      </div>

      {table.status === "occupied" && table.startTime ? (
        <div className="font-mono text-sm text-[var(--color-danger)]">
          <Timer startTime={table.startTime} />
        </div>
      ) : table.status === "free" ? (
        <div className="text-xs text-[var(--color-muted)]">Antippen zum Buchen</div>
      ) : (
        <div className="text-xs text-[var(--color-muted)]">Bereits vergeben</div>
      )}
    </motion.div>
  );
}

type BookingMode = "now" | "reserve";

function BookingModal({
  table,
  onClose,
  onBook,
}: {
  table: TableData;
  onClose: () => void;
  onBook: (mode: BookingMode, name: string) => void;
}) {
  const [mode, setMode] = useState<BookingMode>("now");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onBook(mode, name || "Gast");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] w-full max-w-md p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[var(--color-text)] text-lg">Tisch {table.id}</h2>
            <p className="text-xs text-[var(--color-muted)]">Buchung anfragen</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch */}
        <div className="grid grid-cols-2 gap-2">
          {(["now", "reserve"] as BookingMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={[
                "py-2.5 text-sm rounded-[2px] border transition-all font-medium",
                mode === m
                  ? "border-[var(--color-accent)] bg-amber-950/60 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-surface-2)]",
              ].join(" ")}
            >
              {m === "now" ? "Jetzt spielen" : "Reservieren"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Dein Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vorname"
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Telefon (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 …"
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {mode === "reserve" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Datum *</label>
                <input
                  required
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Uhrzeit *</label>
                <input
                  required
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[var(--color-muted)] mb-1">Dauer</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  {[30, 60, 90, 120, 180].map((m) => (
                    <option key={m} value={m}>{m} Minuten</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1" size="md">
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1" size="md">
              {mode === "now" ? "Jetzt buchen" : "Reservieren"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function BilliardPage() {
  const [tables, setTables] = useState<TableData[]>(MOCK_TABLES);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [successTable, setSuccessTable] = useState<number | null>(null);

  function handleTableClick(table: TableData) {
    if (table.status === "reserved") return;
    if (table.status === "occupied") {
      // Zeige Info – kein Buchen möglich
      return;
    }
    setSelectedTable(table);
  }

  function handleBook(mode: BookingMode, name: string) {
    if (!selectedTable) return;
    if (mode === "now") {
      setTables((prev) =>
        prev.map((t) =>
          t.id === selectedTable.id
            ? { ...t, status: "occupied", startTime: new Date().toISOString() }
            : t
        )
      );
    } else {
      setTables((prev) =>
        prev.map((t) =>
          t.id === selectedTable.id ? { ...t, status: "reserved" } : t
        )
      );
    }
    setSuccessTable(selectedTable.id);
    setSelectedTable(null);
    setTimeout(() => setSuccessTable(null), 4000);
  }

  const free = tables.filter((t) => t.status === "free").length;
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const reserved = tables.filter((t) => t.status === "reserved").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Billard</h1>
          <p className="text-[var(--color-muted)] text-sm mt-1">6 Tische · Live-Status</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
          <span className="text-[var(--color-muted)]">Live</span>
        </div>
      </div>

      {/* Status-Übersicht */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Frei", value: free, color: "text-[var(--color-success)]", dot: "bg-[var(--color-success)]" },
          { label: "Belegt", value: occupied, color: "text-[var(--color-danger)]", dot: "bg-[var(--color-danger)]" },
          { label: "Reserviert", value: reserved, color: "text-[var(--color-warning)]", dot: "bg-[var(--color-warning)]" },
        ].map(({ label, value, color, dot }) => (
          <div key={label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] p-3 text-center">
            <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className="text-xs text-[var(--color-muted)]">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Erfolgs-Banner */}
      <AnimatePresence>
        {successTable !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-green-950/80 border border-green-800 rounded-[2px] px-4 py-3 text-sm text-[var(--color-success)] flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Tisch {successTable} wurde erfolgreich {tables.find(t=>t.id===successTable)?.status === "reserved" ? "reserviert" : "gebucht"}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tisch-Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {tables.map((table, i) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <TableCard table={table} onClick={() => handleTableClick(table)} />
          </motion.div>
        ))}
      </div>

      {/* Legende */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] p-4">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] mb-3">
          <Info className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider font-medium">Preise</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-muted)]">
          <div className="flex items-center justify-between">
            <span>Mo–Do</span>
            <span className="font-mono text-[var(--color-text)]">7 €/Std.</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Fr–So</span>
            <span className="font-mono text-[var(--color-text)]">9 €/Std.</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Schüler</span>
            <span className="font-mono text-[var(--color-text)]">5 €/Std.</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Queue-Leih</span>
            <span className="font-mono text-[var(--color-text)]">kostenlos</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedTable && (
          <BookingModal
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
            onBook={handleBook}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
