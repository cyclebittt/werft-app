import { createClient } from "@/lib/supabase/server";
import { NewsFeed } from "@/components/news/NewsFeed";
import { isOpenNow, getTodayOpeningHours } from "@/lib/utils/time";
import { Anchor, Clock, Circle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import type { NewsPost } from "@/components/news/NewsCard";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("news_posts")
    .select("*")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(30);

  const open = isOpenNow();
  const hours = getTodayOpeningHours();

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          {/* Hero */}
          <section className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Anchor className="w-6 h-6 text-[var(--color-accent)]" />
                  <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
                    Bistro Zur Werft
                  </h1>
                </div>
                <p className="text-[var(--color-muted)] text-sm">
                  Erlenbach am Main · Billard · Gastronomie
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`w-2 h-2 rounded-full ${open ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"}`} />
                <span className={open ? "text-[var(--color-success)]" : "text-[var(--color-muted)]"}>
                  {open ? "Geöffnet" : "Geschlossen"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <Clock className="w-3.5 h-3.5" />
              {hours}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link href="/billiard">
                <Button size="sm" className="gap-2">
                  <Circle className="w-3.5 h-3.5" />
                  Billard buchen
                </Button>
              </Link>
              <Link href="/reserve">
                <Button size="sm" variant="secondary" className="gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Tisch reservieren
                </Button>
              </Link>
              <Link href="/menu">
                <Button size="sm" variant="secondary">Speisekarte</Button>
              </Link>
            </div>
          </section>

          <div className="border-t border-[var(--color-border)]" />

          <section>
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
              Aktuelles
            </h2>
            <NewsFeed posts={(posts ?? []) as NewsPost[]} />
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
