"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Circle, Calendar, Trophy, User } from "lucide-react";

const tabs = [
  { href: "/", label: "News", icon: Newspaper },
  { href: "/billiard", label: "Billard", icon: Circle },
  { href: "/reserve", label: "Reservieren", icon: Calendar },
  { href: "/loyalty", label: "Punkte", icon: Trophy },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur border-t border-[var(--color-border)] md:hidden">
      <div className="grid grid-cols-5 h-16">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center justify-center gap-1 text-[10px] transition-colors",
                active
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]",
              ].join(" ")}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
