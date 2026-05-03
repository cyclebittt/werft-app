import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { revalidatePath } from "next/cache";

async function updateReservationStatus(id: string, status: string) {
  "use server";
  const supabase = await createClient();
  await supabase.from("table_reservations").update({ status }).eq("id", id);
  revalidatePath("/admin/reservations");
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const filterDate = date ?? new Date().toISOString().split("T")[0];

  const supabase = await createClient();
  const { data: reservations } = await supabase
    .from("table_reservations")
    .select("*")
    .eq("date", filterDate)
    .order("time");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Reservierungen</h1>
        <form>
          <input
            name="date"
            type="date"
            defaultValue={filterDate}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </form>
      </div>

      <Card className="divide-y divide-[var(--color-border)]">
        {(reservations ?? []).length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--color-muted)] text-center">
            Keine Reservierungen für diesen Tag.
          </p>
        )}
        {(reservations ?? []).map((r) => (
          <div key={r.id} className="px-4 py-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--color-text)] text-sm">{r.guest_name}</span>
                  <Badge
                    variant={
                      r.status === "confirmed" ? "success"
                        : r.status === "cancelled" ? "danger"
                        : "warning"
                    }
                    size="sm"
                  >
                    {r.status === "confirmed" ? "Bestätigt" : r.status === "cancelled" ? "Abgesagt" : "Ausstehend"}
                  </Badge>
                </div>
                <div className="text-xs text-[var(--color-muted)] space-x-2 mt-0.5">
                  <span>{r.time} Uhr</span>
                  <span>·</span>
                  <span>{r.party_size} Personen</span>
                  <span>·</span>
                  <span>{r.guest_phone}</span>
                </div>
                {r.notes && <p className="text-xs text-[var(--color-muted)] mt-1 italic">{r.notes}</p>}
              </div>

              {r.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <form action={updateReservationStatus.bind(null, r.id, "confirmed")}>
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-[2px] bg-[var(--color-success)] text-white hover:bg-green-600 transition-colors">
                      Bestätigen
                    </button>
                  </form>
                  <form action={updateReservationStatus.bind(null, r.id, "cancelled")}>
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-[2px] border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-red-950 transition-colors">
                      Absagen
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
