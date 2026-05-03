"use client";

import { useState } from "react";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { awardPoints, calcBilliardPoints } from "@/lib/utils/points";

interface ActiveTimerProps {
  bookingId: string;
  tableId: number;
  startTime: string;
  userId?: string;
  onEnd: () => void;
}

export function ActiveTimer({ bookingId, tableId, startTime, userId, onEnd }: ActiveTimerProps) {
  const [loading, setLoading] = useState(false);

  async function handleEnd() {
    setLoading(true);
    try {
      const supabase = createClient();
      const endTime = new Date();
      const durationMin = Math.ceil((endTime.getTime() - new Date(startTime).getTime()) / 60000);

      await supabase
        .from("billiard_bookings")
        .update({
          status: "completed",
          end_time: endTime.toISOString(),
          duration_minutes: durationMin,
          points_earned: calcBilliardPoints(durationMin),
        })
        .eq("id", bookingId);

      await supabase
        .from("billiard_tables")
        .update({ status: "free", current_booking_id: null })
        .eq("id", tableId);

      if (userId) {
        const pts = calcBilliardPoints(durationMin);
        await awardPoints(userId, pts, "billiard_session", supabase);
      }

      onEnd();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] p-6 text-center space-y-4">
      <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Laufende Session – Tisch {tableId}</div>
      <Timer startTime={startTime} className="text-5xl text-[var(--color-accent)]" />
      <div className="text-xs text-[var(--color-muted)]">Abrechnung nach Zeit</div>
      <Button variant="danger" onClick={handleEnd} loading={loading} size="lg" className="w-full">
        Spielen beenden
      </Button>
    </div>
  );
}
