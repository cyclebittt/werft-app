interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "gold" | "silver" | "bronze";
  size?: "sm" | "md";
}

const variants = {
  default: "bg-[var(--color-surface-2)] text-[var(--color-muted)] border-[var(--color-border)]",
  success: "bg-green-950 text-[var(--color-success)] border-green-800",
  warning: "bg-amber-950 text-[var(--color-warning)] border-amber-800",
  danger: "bg-red-950 text-[var(--color-danger)] border-red-900",
  gold: "bg-amber-950 text-amber-400 border-amber-700",
  silver: "bg-slate-800 text-slate-300 border-slate-600",
  bronze: "bg-orange-950 text-orange-400 border-orange-800",
};

const sizes = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
};

export function Badge({ children, variant = "default", size = "md" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center border rounded-[2px] font-medium",
        variants[variant],
        sizes[size],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
