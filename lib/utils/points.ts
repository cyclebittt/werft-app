import type { SupabaseClient } from "@supabase/supabase-js";

export const POINT_RULES = {
  DAILY_CHECKIN: 5,
  BILLIARD_BOOKING: 10,
  BILLIARD_PER_30_MIN: 1,
  TABLE_RESERVATION: 10,
  DRINK_PER_EURO: 1,
} as const;

export const LEVELS = {
  bronze: { min: 0, max: 99, label: "Bronze" },
  silver: { min: 100, max: 299, label: "Silber" },
  gold: { min: 300, max: Infinity, label: "Gold" },
} as const;

export type Level = keyof typeof LEVELS;

export function calculateLevel(points: number): Level {
  if (points >= 300) return "gold";
  if (points >= 100) return "silver";
  return "bronze";
}

export function progressToNextLevel(points: number): {
  current: number;
  max: number;
  percentage: number;
  nextLevel: Level | null;
} {
  if (points >= 300) {
    return { current: points - 300, max: Infinity, percentage: 100, nextLevel: null };
  }
  if (points >= 100) {
    return { current: points - 100, max: 200, percentage: ((points - 100) / 200) * 100, nextLevel: "gold" };
  }
  return { current: points, max: 100, percentage: (points / 100) * 100, nextLevel: "silver" };
}

export async function awardPoints(
  userId: string,
  amount: number,
  reason: string,
  supabase: SupabaseClient
) {
  const { error: txError } = await supabase.from("point_transactions").insert({
    user_id: userId,
    amount,
    reason,
  });
  if (txError) throw txError;

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();
  if (fetchError) throw fetchError;

  const newPoints = (profile.points ?? 0) + amount;
  const newLevel = calculateLevel(newPoints);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: newPoints, level: newLevel })
    .eq("id", userId);
  if (updateError) throw updateError;

  return { points: newPoints, level: newLevel };
}

export function calcBilliardPoints(durationMinutes: number): number {
  return POINT_RULES.BILLIARD_BOOKING + Math.ceil(durationMinutes / 30) * POINT_RULES.BILLIARD_PER_30_MIN;
}
