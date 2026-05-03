"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useUserPoints } from "@/lib/hooks/useUserPoints";
import { generateTimeSlots } from "@/lib/utils/time";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function ReservePage() {
  const { profile } = useUserPoints();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const timeSlots = date ? generateTimeSlots(new Date(date)) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !date || !time) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("table_reservations").insert({
        user_id: profile?.id ?? null,
        guest_name: name,
        guest_phone: phone,
        party_size: partySize,
        date,
        time,
        notes: notes || null,
        status: "pending",
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-4 py-16 text-center space-y-4"
      >
        <CheckCircle className="w-12 h-12 text-[var(--color-success)] mx-auto" />
        <h2 className="text-xl font-bold text-[var(--color-text)]">Reservierung eingegangen!</h2>
        <p className="text-[var(--color-muted)] text-sm">
          Wir melden uns telefonisch zur Bestätigung. Bitte halte dein Handy bereit.
        </p>
        <Button onClick={() => setDone(false)} variant="secondary">
          Neue Reservierung
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Tisch reservieren</h1>
        <p className="text-[var(--color-muted)] text-sm mt-1">
          Wir bestätigen deine Reservierung telefonisch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Telefon *</label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">Personenzahl *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPartySize(n)}
                className={[
                  "w-9 h-9 text-sm rounded-[2px] border transition-colors",
                  partySize === n
                    ? "border-[var(--color-accent)] bg-amber-950 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)]",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Datum *</label>
            <input
              required
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => { setDate(e.target.value); setTime(""); }}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Uhrzeit *</label>
            <select
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">Wählen…</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot} Uhr</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">Anmerkungen (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Geburtstag, Kinderstuhl, …"
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>

        {error && <p className="text-[var(--color-danger)] text-xs">{error}</p>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Reservierung anfragen
        </Button>
      </form>
    </div>
  );
}
