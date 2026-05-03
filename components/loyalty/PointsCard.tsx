"use client";

import { PointsDisplay } from "@/components/ui/PointsDisplay";
import { LevelBadge } from "./LevelBadge";
import { progressToNextLevel } from "@/lib/utils/points";
import type { Level } from "@/lib/utils/points";

interface PointsCardProps {
  points: number;
  level: Level;
  name: string;
}

const nextLevelNames: Record<string, string> = {
  silver: "Silber",
  gold: "Gold",
};

export function PointsCard({ points, level, name }: PointsCardProps) {
  const progress = progressToNextLevel(points);

  return (
    <div className={[
      "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] p-6 space-y-4",
      level === "gold" ? "gold-glow" : "",
    ].join(" ")}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--color-muted)] text-xs uppercase tracking-wider mb-1">Willkommen</p>
          <p className="text-[var(--color-text)] font-semibold">{name}</p>
        </div>
        <LevelBadge level={level} />
      </div>

      <div>
        <PointsDisplay points={points} size="lg" />
      </div>

      {progress.nextLevel && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
            <span>{progress.current} / {progress.max} Pkt. bis {nextLevelNames[progress.nextLevel]}</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
          <div className="h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-700 rounded-full"
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {!progress.nextLevel && (
        <p className="text-xs text-amber-400">Höchstes Level erreicht!</p>
      )}
    </div>
  );
}
