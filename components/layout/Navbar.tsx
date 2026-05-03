"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, LayoutGrid, Calendar, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUserPoints } from "@/lib/hooks/useUserPoints";

const navLinks = [
  { href: "/", label: "News" },
  { href: "/menu", label: "Speisekarte" },
  { href: "/billiard", label: "Billard" },
  { href: "/reserve", label: "Reservieren" },
];

export function Navbar() {
  const pathname = usePathname();
  const { profile } = useUserPoints();

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/90 backdrop-blur border-b border-[var(--color-border)] hidden md:block">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
          <Anchor className="w-5 h-5 text-[var(--color-accent)]" />
          <span className="font-bold text-sm tracking-widest uppercase">Zur Werft</span>
        </Link>

        <nav className="flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                "text-sm transition-colors",
                pathname === href
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <Link
                href="/loyalty"
                className="flex items-center gap-1.5 text-sm text-[var(--color-accent)] font-mono"
              >
                <Trophy className="w-4 h-4" />
                {profile.points}
              </Link>
              <Link href="/profile">
                <div className="w-8 h-8 rounded-[2px] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors">
                  <User className="w-4 h-4 text-[var(--color-muted)]" />
                </div>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="secondary">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
