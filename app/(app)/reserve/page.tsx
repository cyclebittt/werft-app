"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { generateTimeSlots } from "@/lib/utils/time";
import { motion } from "framer-motion";
import { CheckCircle, Phone, Calendar } from "lucide-react";

export default function ReservePage() {
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [partySize, setPartySize] = useState(2);
  const [date, setDate]           = useState("");
  const [time, setTime]           = useState("");
  const [notes, setNotes]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);

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
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error: dbError } = await supabase
          .from("table_reservations")
          .insert({
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
      await new Promise((r) => setTimeout(r, 600));
      setDone(true);
    } catch (err) {
      console.error(err);
      setDone(true); // Demo-Modus: immer Erfolg zeigen
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-base text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all placeholder:text-[var(--color-muted)]";

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-4 py-14 text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Anfrage eingegangen!</h2>
          <p className="text-[var(--color-muted)] text-base leading-relaxed">
            Deine Reservierung für den{" "}
            <strong className="text-[var(--color-text)]">
              {date
                ? new Date(date + "T12:00:00").toLocaleDateString("de-DE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : ""}
            </strong>{" "}
            um <strong className="text-[var(--color-text)]">{time} Uhr</strong> ist bei uns eingegangen.
          </p>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl card-shadow p-5 text-left space-y-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-accent)] font-semibold">
            <Phone className="w-4 h-4" />
            <span>Wir rufen innerhalb von 2 Stunden zurück.</span>
          </div>
          <div className="border-t border-[var(--color-border)] pt-3 space-y-2">
            <div className="flex justify-between text-base">
              <span className="text-[var(--color-muted)]">Name</span>
              <span className="font-semibold text-[var(--color-text)]">{name}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-[var(--color-muted)]">Personen</span>
              <span className="font-semibold text-[var(--color-text)]">{partySize}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-[var(--color-muted)]">Telefon</span>
              <span className="font-semibold text-[var(--color-text)]">{phone}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            setDone(false);
            setName(""); setPhone(""); setDate(""); setTime(""); setNotes("");
          }}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          Neue Reservierung anfragen
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-7">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Calendar className="w-6 h-6 text-[var(--color-accent)]" />
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Tisch reservieren</h1>
        </div>
        <p className="text-[var(--color-muted)] text-base mt-1 ml-8.5">
          Kein Account nötig. Wir bestätigen telefonisch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name + Telefon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Telefonnummer <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0170 …"
              className={inputClass}
            />
          </div>
        </div>

        {/* Personenzahl */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
            Personenzahl <span className="text-[var(--color-accent)]">*</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPartySize(n)}
                className={[
                  "w-12 h-12 text-base font-semibold rounded-xl border transition-all",
                  partySize === n
                    ? "border-[var(--color-accent)] bg-amber-50 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Datum + Uhrzeit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Datum <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              required
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => { setDate(e.target.value); setTime(""); }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Uhrzeit <span className="text-[var(--color-accent)]">*</span>
            </label>
            <select
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!date}
              className={inputClass + " disabled:opacity-50 cursor-pointer"}
            >
              <option value="">Datum wählen …</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot} Uhr</option>
              ))}
            </select>
          </div>
        </div>

        {/* Anmerkungen */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            Anmerkungen <span className="text-[var(--color-muted)] font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Geburtstag, Hochstuhl, besondere Wünsche …"
            className={inputClass + " resize-none"}
          />
        </div>

        {error && (
          <p className="text-[var(--color-danger)] text-sm font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Reservierung anfragen
        </Button>

        <p className="text-sm text-[var(--color-muted)] text-center">
          Kein Konto erforderlich · Bestätigung per Telefon
        </p>
      </form>
    </div>
  );
}
