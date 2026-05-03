import { createClient } from "@/lib/supabase/server";
import { PointsCard } from "@/components/loyalty/PointsCard";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils/time";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Circle, Calendar } from "lucide-react";
import type { Level } from "@/lib/utils/points";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: recentBookings } = await supabase
    .from("billiard_bookings")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: recentReservations } = await supabase
    .from("table_reservations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <PointsCard
        points={profile?.points ?? 0}
        level={(profile?.level ?? "bronze") as Level}
        name={profile?.name ?? ""}
      />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/billiard">
          <Button variant="secondary" className="w-full gap-2">
            <Circle className="w-4 h-4" />
            Billard buchen
          </Button>
        </Link>
        <Link href="/reserve">
          <Button variant="secondary" className="w-full gap-2">
            <Calendar className="w-4 h-4" />
            Tisch reservieren
          </Button>
        </Link>
      </div>

      {(recentBookings?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-3">
            Letzte Billard-Buchungen
          </h2>
          <Card className="divide-y divide-[var(--color-border)]">
            {recentBookings!.map((b) => (
              <div key={b.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="text-[var(--color-text)]">Tisch {b.table_id}</span>
                  <p className="text-xs text-[var(--color-muted)]">{formatDateTime(b.start_time)}</p>
                </div>
                <span className={[
                  "text-xs",
                  b.status === "active" ? "text-[var(--color-success)]" : "text-[var(--color-muted)]",
                ].join(" ")}>
                  {b.status === "active" ? "Aktiv" : b.status === "completed" ? "Beendet" : b.status}
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}

      {(recentReservations?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-3">
            Letzte Reservierungen
          </h2>
          <Card className="divide-y divide-[var(--color-border)]">
            {recentReservations!.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="text-[var(--color-text)]">{r.guest_name}</span>
                  <p className="text-xs text-[var(--color-muted)]">{r.date} · {r.time} Uhr · {r.party_size} Personen</p>
                </div>
                <span className={[
                  "text-xs",
                  r.status === "confirmed" ? "text-[var(--color-success)]"
                    : r.status === "cancelled" ? "text-[var(--color-danger)]"
                    : "text-[var(--color-warning)]",
                ].join(" ")}>
                  {r.status === "confirmed" ? "Bestätigt" : r.status === "cancelled" ? "Abgesagt" : "Ausstehend"}
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
