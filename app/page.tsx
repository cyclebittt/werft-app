import { isOpenNow, getTodayOpeningHours } from "@/lib/utils/time";
import { Anchor, Clock, Circle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { NewsFeed } from "@/components/news/NewsFeed";
import type { NewsPost } from "@/components/news/NewsCard";

// Demo-News – werden durch echte Daten aus Supabase ersetzt sobald konfiguriert
const DEMO_POSTS: NewsPost[] = [
  {
    id: "1",
    title: "Neu: Wochenend-Turnier jeden Samstag!",
    content:
      "Ab sofort veranstalten wir jeden Samstag ab 18 Uhr ein offenes Billard-Turnier. Eintritt frei, Getränke-Flat für Teilnehmer 12 €. Anmeldung direkt vor Ort oder über die App. Preise für die ersten drei Plätze warten auf euch!",
    image_url: null,
    type: "event",
    pinned: true,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Neues Frühstücksangebot ab 08:00 Uhr",
    content:
      "Wir starten jetzt schon früher in den Tag! Frühstück mit frischen Brötchen, Rührei, Aufschnitt und Kaffee oder Tee. Das Frühstücksbuffet gibt es Mo–Fr von 08:00 bis 11:00 Uhr. Komm vorbei und starte deinen Tag bei uns.",
    image_url: null,
    type: "special",
    pinned: false,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Champions League live bei uns",
    content:
      "Alle UEFA Champions League Spiele siehst du bei uns live auf der großen Leinwand. Komm mit deinen Freunden, gönn dir ein kühles Bier und erlebe die besten Spiele Europas live in der Werft-Atmosphäre.",
    image_url: null,
    type: "sport",
    pinned: false,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Werft-App jetzt online!",
    content:
      "Unsere neue App ist live! Jetzt kannst du Billiardtische direkt buchen, Tische für dein nächstes Essen reservieren, die aktuelle Speisekarte einsehen und Punkte für jeden Besuch sammeln. Registriere dich und sichere dir 50 Willkommenspunkte.",
    image_url: null,
    type: "general",
    pinned: false,
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function fetchPosts(): Promise<NewsPost[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return DEMO_POSTS;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("news_posts")
      .select("*")
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(30);
    return data?.length ? (data as NewsPost[]) : DEMO_POSTS;
  } catch {
    return DEMO_POSTS;
  }
}

export default async function HomePage() {
  const posts = await fetchPosts();
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
                <div className="flex items-center gap-2 mb-1">
                  <Anchor className="w-6 h-6 text-[var(--color-accent)]" />
                  <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
                    Bistro Zur Werft
                  </h1>
                </div>
                <p className="text-[var(--color-muted)] text-sm">
                  Erlenbach am Main · Billard · Gastronomie
                </p>
              </div>
              <div className={[
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-[2px] border",
                open
                  ? "border-green-800 bg-green-950/50 text-[var(--color-success)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)]",
              ].join(" ")}>
                <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-[var(--color-success)] animate-pulse" : "bg-[var(--color-muted)]"}`} />
                {open ? "Geöffnet" : "Geschlossen"}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 w-fit">
              <Clock className="w-3.5 h-3.5" />
              Heute: {hours}
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

          {/* News */}
          <section>
            <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-4">
              Aktuelles
            </h2>
            <NewsFeed posts={posts} />
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
