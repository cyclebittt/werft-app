import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils/time";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [billardRes, reserveRes, pendingRewardsRes] = await Promise.all([
    supabase
      .from("billiard_bookings")
      .select("*, billiard_tables(id)")
      .gte("start_time", `${today}T00:00:00`)
      .order("start_time"),
    supabase
      .from("table_reservations")
      .select("*")
      .eq("date", today)
      .order("time"),
    supabase
      .from("reward_redemptions")
      .select("*, rewards(name), profiles(name)")
      .eq("confirmed", false),
  ]);

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-xl font-bold text-[var(--color-text)]">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Billard heute", value: billardRes.data?.length ?? 0 },
          { label: "Reservierungen heute", value: reserveRes.data?.length ?? 0 },
          { label: "Offene Prämien", value: pendingRewardsRes.data?.length ?? 0 },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4 text-center">
            <p className="text-3xl font-mono font-bold text-[var(--color-accent)]">{value}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
          Billard-Buchungen heute
        </h2>
        <Card className="divide-y divide-[var(--color-border)]">
          {(billardRes.data ?? []).length === 0 && (
            <p className="px-4 py-3 text-sm text-[var(--color-muted)]">Keine Buchungen.</p>
          )}
          {(billardRes.data ?? []).map((b) => (
            <div key={b.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <span className="text-[var(--color-text)]">Tisch {b.table_id}</span>
                <span className="text-[var(--color-muted)] ml-2">{b.guest_name ?? "App-Nutzer"}</span>
              </div>
              <div className="text-right">
                <span className="text-[var(--color-muted)] text-xs">{formatDateTime(b.start_time)}</span>
                <span className={[
                  "ml-2 text-xs",
                  b.status === "active" ? "text-[var(--color-success)]"
                    : b.status === "completed" ? "text-[var(--color-muted)]"
                    : "text-[var(--color-warning)]",
                ].join(" ")}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </section>

      {(pendingRewardsRes.data ?? []).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
            Prämien-Einlösungen bestätigen
          </h2>
          <PendingRewards redemptions={pendingRewardsRes.data!} />
        </section>
      )}
    </div>
  );
}

function PendingRewards({ redemptions }: { redemptions: Array<{ id: string; rewards: { name: string } | null; profiles: { name: string } | null }> }) {
  return (
    <Card className="divide-y divide-[var(--color-border)]">
      {redemptions.map((r) => (
        <div key={r.id} className="px-4 py-3 flex items-center justify-between text-sm">
          <div>
            <span className="text-[var(--color-text)]">{r.rewards?.name ?? "Prämie"}</span>
            <span className="text-[var(--color-muted)] ml-2">{r.profiles?.name ?? "Nutzer"}</span>
          </div>
          <ConfirmRewardButton id={r.id} />
        </div>
      ))}
    </Card>
  );
}

function ConfirmRewardButton({ id }: { id: string }) {
  "use client";
  return (
    <form action={async () => {
      "use server";
      const supabase = await (await import("@/lib/supabase/server")).createClient();
      await supabase.from("reward_redemptions").update({ confirmed: true }).eq("id", id);
    }}>
      <button type="submit" className="text-xs px-3 py-1.5 rounded-[2px] bg-[var(--color-accent)] text-black hover:bg-amber-400 transition-colors">
        Bestätigen
      </button>
    </form>
  );
}
