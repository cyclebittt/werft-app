"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface BilliardBooking {
  id: string;
  table_id: number;
  user_id: string | null;
  guest_name: string | null;
  start_time: string;
  duration_minutes: number | null;
  end_time: string | null;
  status: "pending" | "active" | "completed" | "cancelled";
  points_earned: number;
}

export function useActiveBooking(tableId?: number) {
  const [booking, setBooking] = useState<BilliardBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableId) { setLoading(false); return; }
    const supabase = createClient();

    async function fetch() {
      const { data } = await supabase
        .from("billiard_bookings")
        .select("*")
        .eq("table_id", tableId)
        .eq("status", "active")
        .maybeSingle();
      setBooking(data as BilliardBooking | null);
      setLoading(false);
    }

    fetch();
  }, [tableId]);

  return { booking, loading };
}
