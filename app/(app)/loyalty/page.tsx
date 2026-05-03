import { createClient } from "@/lib/supabase/server";
import { PointsCard } from "@/components/loyalty/PointsCard";
import { RewardsList } from "@/components/loyalty/RewardsList";
import { TransactionHistory } from "@/components/loyalty/TransactionHistory";
import type { Level } from "@/lib/utils/points";
import type { Reward } from "@/components/loyalty/RewardsList";

export default async function LoyaltyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, rewardsRes, txRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("rewards").select("*").order("points_required"),
    supabase
      .from("point_transactions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileRes.data;
  const rewards = (rewardsRes.data ?? []) as Reward[];
  const transactions = txRes.data ?? [];

  const levelBenefits: Record<string, string[]> = {
    silver: [
      "Priorität bei Reservierungsanfragen",
      "Exklusive Silber-Mitglieder Events",
    ],
    gold: [
      "Höchste Priorität bei Reservierungen",
      "1× Freigetränk pro Monat",
      "Gold-Mitglieder Lounge-Zugang",
    ],
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <PointsCard
        points={profile?.points ?? 0}
        level={(profile?.level ?? "bronze") as Level}
        name={profile?.name ?? ""}
      />

      {levelBenefits[profile?.level ?? ""] && (
        <section>
          <h2 className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-3">Deine Vorteile</h2>
          <ul className="space-y-2">
            {levelBenefits[profile!.level].map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                <span className="text-[var(--color-accent)]">✓</span> {b}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-4">Prämien einlösen</h2>
        <RewardsList
          rewards={rewards}
          userPoints={profile?.points ?? 0}
          userId={user!.id}
          onRedeem={() => {}}
        />
      </section>

      <section>
        <h2 className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-3">Punkte-Historie</h2>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-4">
          <TransactionHistory transactions={transactions} />
        </div>
      </section>
    </div>
  );
}
