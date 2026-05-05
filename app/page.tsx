import { isOpenNow, getTodayOpeningHours } from "@/lib/utils/time";
import { Anchor, Clock, Circle, Calendar, UtensilsCrossed } from "lucide-react";
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
    title: "Frühstück ab 08:00 Uhr – Mo bis Fr",
    content:
      "Wir starten jetzt schon früher in den Tag! Frühstück mit frischen Brötchen, Rührei, Aufschnitt und Kaffee oder Tee. Das Frühstücksangebot gibt es Montag bis Freitag von 08:00 bis 11:00 Uhr. Komm vorbei!",
    image_url: null,
    type: "special",
    pinned: false,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Champions League live auf der großen Leinwand",
    content:
      "Alle UEFA Champions League Spiele siehst du bei uns live. Komm mit deinen Freunden, gönn dir ein kühles Bier und erlebe die besten Spiele Europas in der Werft-Atmosphäre.",
    image_url: null,
    type: "sport",
    pinned: false,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Werft-App jetzt online!",
    content:
      "Unsere neue App ist live! Jetzt kannst du Billiardtische direkt buchen, Tische reservieren, die aktuelle Speisekarte einsehen und Punkte für jeden Besuch sammeln. Registriere dich und sichere dir 50 Willkommenspunkte.",
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
      <main className="flex-1 pb-24 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

          {/* Hero */}
          <section className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Anchor className="w-7 h-7 text-[var(--color-accent)]" />
                  <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
                    Bistro Zur Werft
                  </h1>
                </div>
                <p className="text-[var(--color-muted)] text-base ml-10">
                  Erlenbach am Main · Billard · Gastronomie
                </p>
              </div>

              {/* Open/Closed status */}
              <div
                className={[
                  "flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border",
                  open
                    ? "border-green-300 bg-green-50 text-green-800"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]",
                ].join(" ")}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    open ? "bg-green-500 animate-pulse" : "bg-[var(--color-border)]"
                  }`}
                />
                {open ? "Geöffnet" : "Geschlossen"}
              </div>
            </div>

            {/* Opening hours */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 w-fit card-shadow">
              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Heute geöffnet: <strong className="text-[var(--color-text)]">{hours}</strong></span>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <Link href="/billiard">
                <Button size="md" className="gap-2 text-base">
                  <Circle className="w-4 h-4" />
                  Billard buchen
                </Button>
              </Link>
              <Link href="/reserve">
                <Button size="md" variant="secondary" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Tisch reservieren
                </Button>
              </Link>
              <Link href="/menu">
                <Button size="md" variant="secondary" className="gap-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  Speisekarte
                </Button>
              </Link>
            </div>
          </section>

          <div className="border-t border-[var(--color-border)]" />

          {/* News */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-5">
              Aktuelles & Neuigkeiten
            </h2>
            <NewsFeed posts={posts} />
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
