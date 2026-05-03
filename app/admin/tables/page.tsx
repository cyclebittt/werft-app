import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { revalidatePath } from "next/cache";

type TableStatus = "free" | "occupied" | "reserved" | "blocked";

const statusLabels: Record<TableStatus, string> = {
  free: "Frei",
  occupied: "Belegt",
  reserved: "Reserviert",
  blocked: "Gesperrt",
};

const statusColors: Record<TableStatus, string> = {
  free: "text-[var(--color-success)]",
  occupied: "text-[var(--color-danger)]",
  reserved: "text-[var(--color-warning)]",
  blocked: "text-[var(--color-muted)]",
};

async function setTableStatus(tableId: number, status: string) {
  "use server";
  const supabase = await createClient();
  await supabase.from("billiard_tables").update({ status }).eq("id", tableId);
  if (status === "free") {
    const { data: booking } = await supabase
      .from("billiard_bookings")
      .select("id")
      .eq("table_id", tableId)
      .eq("status", "active")
      .maybeSingle();
    if (booking) {
      await supabase
        .from("billiard_bookings")
        .update({ status: "completed", end_time: new Date().toISOString() })
        .eq("id", booking.id);
    }
  }
  revalidatePath("/admin/tables");
}

export default async function AdminTablesPage() {
  const supabase = await createClient();
  const { data: tables } = await supabase
    .from("billiard_tables")
    .select("*, billiard_bookings(id, guest_name, start_time, status)")
    .order("id");

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-[var(--color-text)]">Tischverwaltung</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(tables ?? []).map((table) => {
          const status = (table.status ?? "free") as TableStatus;
          return (
            <Card key={table.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-[var(--color-text)]">
                  {String(table.id).padStart(2, "0")}
                </span>
                <span className={`text-xs font-medium ${statusColors[status]}`}>
                  {statusLabels[status]}
                </span>
              </div>
              <div className="space-y-1.5">
                {(["free", "occupied", "reserved", "blocked"] as TableStatus[]).map((s) => (
                  <form key={s} action={setTableStatus.bind(null, table.id, s)}>
                    <button
                      type="submit"
                      className={[
                        "w-full text-left px-2.5 py-1.5 text-xs rounded-[2px] border transition-colors",
                        status === s
                          ? "border-[var(--color-accent)] bg-amber-950 text-[var(--color-accent)]"
                          : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]",
                      ].join(" ")}
                    >
                      {statusLabels[s]}
                    </button>
                  </form>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
