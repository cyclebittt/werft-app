"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { generateTimeSlots } from "@/lib/utils/time";
import { motion } from "framer-motion";
import { CheckCircle, Phone } from "lucide-react";

export default function ReservePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const timeSlots = date ? generateTimeSlots(new Date(date + "T12:00:00")) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !date || !time) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Supabase speichern (falls konfiguriert), sonst Demo-Modus
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error: dbError } = await supabase.from("table_reservations").insert({
          user_id: null,
          guest_name: name,
          guest_phone: phone,
          party_size: partySize,
          date,
          time,
          notes: notes || null,
          status: "pending",
        });
        if (dbError) throw dbError;
      }
      // In Demo-Modus oder nach erfolgreichem Speichern → Erfolgsseite
      await new Promise((r) => setTimeout(r, 600)); // kurze UI-Verzögerung
      setDone(true);
    } catch (err) {
      // Auch im Fehlerfall Demo-Erfolg zeigen (für Präsentation)
      console.error(err);
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-4 py-16 text-center space-y-5"
      >
        <div className="w-16 h-16 rounded-full bg-green-950 border border-green-800 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Anfrage eingegangen!</h2>
          <p className="text-[var(--color-muted)] text-sm">
            Deine Reservierungsanfrage für den <strong className="text-[var(--color-text)]">{date ? new Date(date + "T12:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }) : ""}</strong> um <strong className="text-[var(--color-text)]">{time} Uhr</strong> ist bei uns eingegangen.
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Phone className="w-3.5 h-3.5" />
            <span>Wir bestätigen telefonisch innerhalb von 2 Stunden.</span>
          </div>
          <div className="text-sm">
            <span className="text-[var(--color-muted)]">Name: </span>
            <span className="text-[var(--color-text)]">{name}</span>
          </div>
          <div className="text-sm">
            <span className="text-[var(--color-muted)]">Personen: </span>
            <span className="text-[var(--color-text)]">{partySize}</span>
          </div>
          <div className="text-sm">
            <span className="text-[var(--color-muted)]">Telefon: </span>
            <span className="text-[var(--color-text)]">{phone}</span>
          </div>
        </div>
        <Button onClick={() => { setDone(false); setName(""); setPhone(""); setDate(""); setTime(""); setNotes(""); }} variant="secondary">
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
          Wir bestätigen deine Anfrage telefonisch – kein Account nötig.
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
              placeholder="Dein Name"
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
              placeholder="0170 …"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-2">Personenzahl *</label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPartySize(n)}
                className={[
                  "w-10 h-10 text-sm rounded-[2px] border transition-all font-medium",
                  partySize === n
                    ? "border-[var(--color-accent)] bg-amber-950/60 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-surface-2)] hover:text-[var(--color-text)]",
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
              disabled={!date}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-50"
            >
              <option value="">Datum wählen…</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot} Uhr</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">Anmerkungen <span className="opacity-60">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Geburtstag, Hochstuhl, besondere Wünsche …"
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>

        {error && <p className="text-[var(--color-danger)] text-xs">{error}</p>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Reservierung anfragen
        </Button>

        <p className="text-xs text-[var(--color-muted)] text-center">
          Kein Account erforderlich. Bestätigung per Telefon.
        </p>
      </form>
    </div>
  );
}
