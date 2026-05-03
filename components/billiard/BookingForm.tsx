"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { awardPoints, POINT_RULES } from "@/lib/utils/points";

interface BookingFormProps {
  tableId: number;
  userId?: string;
  userName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({ tableId, userId, userName, onSuccess, onCancel }: BookingFormProps) {
  const [mode, setMode] = useState<"now" | "reserve">("now");
  const [guestName, setGuestName] = useState(userName ?? "");
  const [guestPhone, setGuestPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const now = new Date();
      const startTime = mode === "now" ? now.toISOString() : new Date(`${date}T${time}`).toISOString();
      const endTime = mode === "reserve"
        ? new Date(new Date(`${date}T${time}`).getTime() + duration * 60000).toISOString()
        : null;

      const { error: bookingError } = await supabase.from("billiard_bookings").insert({
        table_id: tableId,
        user_id: userId ?? null,
        guest_name: !userId ? guestName : null,
        guest_phone: !userId ? guestPhone : null,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: mode === "reserve" ? duration : null,
        status: "active",
      });

      if (bookingError) throw bookingError;

      await supabase
        .from("billiard_tables")
        .update({ status: mode === "now" ? "occupied" : "reserved" })
        .eq("id", tableId);

      if (userId) {
        await awardPoints(userId, POINT_RULES.BILLIARD_BOOKING, "billiard_booking", supabase);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Buchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("now")}
          className={[
            "py-2.5 text-sm rounded-[2px] border transition-colors",
            mode === "now"
              ? "border-[var(--color-accent)] bg-amber-950 text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-muted)]",
          ].join(" ")}
        >
          Jetzt spielen
        </button>
        <button
          type="button"
          onClick={() => setMode("reserve")}
          className={[
            "py-2.5 text-sm rounded-[2px] border transition-colors",
            mode === "reserve"
              ? "border-[var(--color-accent)] bg-amber-950 text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-muted)]",
          ].join(" ")}
        >
          Reservieren
        </button>
      </div>

      {!userId && (
        <>
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Name *</label>
            <input
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Dein Name"
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Telefon *</label>
            <input
              required
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+49 ..."
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </>
      )}

      {mode === "reserve" && (
        <>
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
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">Geplante Dauer</label>
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
        </>
      )}

      {error && <p className="text-[var(--color-danger)] text-xs">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {mode === "now" ? "Jetzt buchen" : "Reservieren"}
        </Button>
      </div>
    </form>
  );
}
