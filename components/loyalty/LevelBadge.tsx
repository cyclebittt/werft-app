import { Badge } from "@/components/ui/Badge";
import type { Level } from "@/lib/utils/points";

interface LevelBadgeProps {
  level: Level;
  size?: "sm" | "md" | "lg";
}

const levelConfig: Record<Level, { label: string; variant: "gold" | "silver" | "bronze"; emoji: string }> = {
  gold: { label: "Gold", variant: "gold", emoji: "★" },
  silver: { label: "Silber", variant: "silver", emoji: "◆" },
  bronze: { label: "Bronze", variant: "bronze", emoji: "●" },
};

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const { label, variant, emoji } = levelConfig[level];
  return (
    <Badge variant={variant} size={size === "lg" ? "md" : "sm"}>
      {emoji} {label}
    </Badge>
  );
}
