"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, CheckCircle, AlertCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { createClient } from "@/lib/supabase/client";
import { useBilliardTables, type BilliardTable } from "@/lib/hooks/useBilliardTables";
import { awardPoints, calcBilliardPoints } from "@/lib/utils/points";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TableStatus = "free" | "occupied" | "reserved";
type BookingMode = "now" | "reserve";
type EnrichedTable = BilliardTable & { startTime?: string };

// ─── Status Config ──────────────────────────────────────────────────────────────

const statusConfig: Record<TableStatus, {
  dot: string;
  label: string;
  labelColor: string;
  cardBorder: string;
  cardBg: string;
}> = {
  free: {
    dot: "bg-green-500",
    label: "Frei",
    labelColor: "text-green-700",
    cardBorder: "border-green-200 hover:border-green-400",
    cardBg: "bg-green-50 hover:bg-green-50/80",
  },
  occupied: {
    dot: "bg-red-500",
    label: "Belegt",
    labelColor: "text-red-700",
    cardBorder: "border-red-200",
    cardBg: "bg-red-50",
  },
  reserved: {
    dot: "bg-amber-500",
    label: "Reserviert",
    labelColor: "text-amber-700",
    cardBorder: "border-amber-200",
    cardBg: "bg-amber-50",
  },
};

// ─── TableCard ──────────────────────────────────────────────────────────────────

function TableCard({ table, onClick }: { table: EnrichedTable; onClick: () => void }) {
  const cfg = statusConfig[table.status];
  const clickable = table.status === "free";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={clickable ? { scale: 1.02 } : {}}
      onClick={clickable ? onClick : undefined}
      className={[
        "border rounded-2xl p-5 transition-all duration-200",
        cfg.cardBorder,
        cfg.cardBg,
        "card-shadow",
        clickable ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-4xl font-bold text-[var(--color-text)] leading-none">
          {String(table.id).padStart(2, "0")}
        </span>
        <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${cfg.dot} ${
          table.status === "free" ? "animate-pulse" : ""
        }`} />
      </div>

      <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${cfg.labelColor}`}>
        {cfg.label}
      </div>

      {table.status === "occupied" && table.startTime ? (
        <div className="font-mono text-sm font-semibold text-red-700">
          <Timer startTime={table.startTime} />
        </div>
      ) : table.status === "free" ? (
        <div className="text-sm text-green-700 font-medium">Tippen zum Buchen</div>
      ) : (
        <div className="text-sm text-amber-700 font-medium">Bereits vergeben</div>
      )}
    </motion.div>
  );
}

// ─── BookingModal ───────────────────────────────────────────────────────────────

function BookingModal({
  table,
  onClose,
  onBook,
  submitting,
}: {
  table: EnrichedTable;
  onClose: () => void;
  onBook: (mode: BookingMode, name: string, phone: string, date?: string, time?: string, duration?: number) => void;
  submitting: boolean;
}) {
  const [mode, setMode]       = useState<BookingMode>("now");
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [date, setDate]       = useState("");
  const [time, setTime]       = useState("");
  const [duration, setDuration] = useState(60);

  const inputClass =
    "w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-base text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all placeholder:text-[var(--color-muted)]";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onBook(mode, name || "Gast", phone, date, time, duration);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white border border-[var(--color-border)] rounded-2xl card-shadow-md w-full max-w-md p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Tisch {table.id}</h2>
            <p className="text-sm text-[var(--color-muted)]">Buchung anfragen</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-2 rounded-lg hover:bg-[var(--color-surface-2)]"
            aria-label="Schließen"
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
                "py-3 text-base font-semibold rounded-xl border transition-all",
                mode === m
                  ? "border-[var(--color-accent)] bg-amber-50 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:border-[var(--color-accent)]",
              ].join(" ")}
            >
              {m === "now" ? "Jetzt spielen" : "Reservieren"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Name <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ihr Name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Telefon <span className="text-[var(--color-muted)] font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 …"
              className={inputClass}
            />
          </div>

          {mode === "reserve" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                  Datum <span className="text-[var(--color-accent)]">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                  Uhrzeit <span className="text-[var(--color-accent)]">*</span>
                </label>
                <input
                  required
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                  Gewünschte Dauer
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={inputClass + " cursor-pointer"}
                >
                  {[30, 60, 90, 120, 180].map((m) => (
                    <option key={m} value={m}>{m} Minuten</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1" size="md">
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1" size="md" disabled={submitting} loading={submitting}>
              {mode === "now" ? "Jetzt buchen" : "Reservieren"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BilliardPage() {
  const { tables, loading } = useBilliardTables();
  const [startTimes, setStartTimes]       = useState<Record<number, string>>({});
  const [selectedTable, setSelectedTable] = useState<EnrichedTable | null>(null);
  const [successTable, setSuccessTable]   = useState<number | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [submitting, setSubmitting]       = useState(false);

  // Fetch start times for currently occupied tables
  useEffect(() => {
    const occupied = tables.filter(
      (t) => t.status === "occupied" && t.current_booking_id
    );
    if (occupied.length === 0) return;

    const supabase = createClient();
    const ids = occupied.map((t) => t.current_booking_id!);

    supabase
      .from("billiard_bookings")
      .select("id, table_id, start_time")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<number, string> = {};
        data.forEach((b) => { map[b.table_id] = b.start_time; });
        setStartTimes(map);
      });
  }, [tables]);

  const enrichedTables: EnrichedTable[] = tables.map((t) => ({
    ...t,
    startTime: startTimes[t.id],
  }));

  async function handleBook(
    mode: BookingMode,
    name: string,
    phone: string,
    date?: string,
    time?: string,
    duration?: number
  ) {
    if (!selectedTable) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const startTime =
      mode === "now"
        ? new Date().toISOString()
        : new Date(`${date}T${time}`).toISOString();
    const durationMins = duration ?? 60;

    const { data: newBooking, error: insertError } = await supabase
      .from("billiard_bookings")
      .insert({
        table_id: selectedTable.id,
        user_id: user?.id ?? null,
        guest_name: name,
        guest_phone: phone || null,
        start_time: startTime,
        duration_minutes: durationMins,
        status: mode === "now" ? "active" : "pending",
        points_earned: user && mode === "now" ? calcBilliardPoints(durationMins) : 0,
      })
      .select()
      .single();

    if (insertError || !newBooking) {
      setError("Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.");
      setSubmitting(false);
      return;
    }

    await supabase
      .from("billiard_tables")
      .update({
        status: mode === "now" ? "occupied" : "reserved",
        current_booking_id: mode === "now" ? newBooking.id : null,
      })
      .eq("id", selectedTable.id);

    if (user && mode === "now") {
      try {
        await awardPoints(
          user.id,
          calcBilliardPoints(durationMins),
          `Billard Tisch ${selectedTable.id}`,
          supabase
        );
      } catch {
        // Points failure is non-blocking
      }
    }

    setSuccessTable(selectedTable.id);
    setSelectedTable(null);
    setSubmitting(false);
    setTimeout(() => setSuccessTable(null), 4000);
  }

  const free     = enrichedTables.filter((t) => t.status === "free").length;
  const occupied = enrichedTables.filter((t) => t.status === "occupied").length;
  const reserved = enrichedTables.filter((t) => t.status === "reserved").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Circle className="w-6 h-6 text-[var(--color-accent)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text)]">Billard</h1>
          </div>
          <p className="text-[var(--color-muted)] text-base ml-8.5">6 Tische · Live-Status</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 card-shadow">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[var(--color-muted)] font-medium">Live</span>
        </div>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Frei",      value: free,     dot: "bg-green-500", bg: "bg-green-50 border-green-200",  text: "text-green-700"  },
          { label: "Belegt",    value: occupied, dot: "bg-red-500",   bg: "bg-red-50 border-red-200",      text: "text-red-700"    },
          { label: "Reserviert",value: reserved, dot: "bg-amber-500", bg: "bg-amber-50 border-amber-200",  text: "text-amber-700"  },
        ].map(({ label, value, dot, bg, text }) => (
          <div
            key={label}
            className={`border rounded-2xl p-4 text-center card-shadow ${bg}`}
          >
            <div className={`text-3xl font-mono font-bold ${text}`}>
              {loading ? "–" : value}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <span className={`text-sm font-medium ${text}`}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-base text-red-800 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {successTable !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-base text-green-800 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Tisch {successTable} wurde erfolgreich gebucht. Viel Spaß!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border border-[var(--color-border)] rounded-2xl p-5 bg-white animate-pulse h-32"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {enrichedTables.map((table, i) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <TableCard
                table={table}
                onClick={() => setSelectedTable(table)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Preise */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl card-shadow p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)] mb-4">
          <Info className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Preise</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Montag – Donnerstag", price: "7,00 € / Stunde" },
            { label: "Freitag – Sonntag",   price: "9,00 € / Stunde" },
            { label: "Schüler & Studenten", price: "5,00 € / Stunde" },
            { label: "Queue-Verleih",       price: "kostenlos"       },
          ].map(({ label, price }) => (
            <div key={label} className="bg-[var(--color-surface-2)] rounded-xl px-4 py-3">
              <div className="text-sm text-[var(--color-muted)]">{label}</div>
              <div className="text-base font-bold text-[var(--color-text)] mt-0.5">{price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedTable && (
          <BookingModal
            table={selectedTable}
            onClose={() => !submitting && setSelectedTable(null)}
            onBook={handleBook}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
