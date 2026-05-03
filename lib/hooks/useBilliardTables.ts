"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type TableStatus = "free" | "occupied" | "reserved";

export interface BilliardTable {
  id: number;
  status: TableStatus;
  current_booking_id: string | null;
}

export function useBilliardTables() {
  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchTables() {
      const { data } = await supabase
        .from("billiard_tables")
        .select("*")
        .order("id");
      if (data) setTables(data as BilliardTable[]);
      setLoading(false);
    }

    fetchTables();

    const channel = supabase
      .channel("billiard-tables")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "billiard_tables" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setTables((prev) =>
              prev.map((t) =>
                t.id === (payload.new as BilliardTable).id
                  ? (payload.new as BilliardTable)
                  : t
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tables, loading };
}
