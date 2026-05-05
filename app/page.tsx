import { isOpenNow, getTodayOpeningHours } from "@/lib/utils/time";
import { Clock, Circle, Calendar, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { NewsFeed } from "@/components/news/NewsFeed";
import type { NewsPost } from "@/components/news/NewsCard";

const DEMO_POSTS: NewsPost[] = [
  {
    id: "1",
    title: "Neu: Wochenend-Turnier jeden Samstag!",
    content:
      "Ab sofort veranstalten wir jeden Samstag ab 18 Uhr ein offenes Billard-Turnier. Eintritt frei, Getränke-Flat für Teilnehmer 12 €. Anmeldung direkt vor Ort oder über die App. Preise für die ersten drei Plätze warten auf euch!",
    image_url:
      "https://images.unsplash.com/photo-1611325999620-07697d7e84dd?w=800&q=80",
    type: "event",
    pinned: true,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Frühstück ab 08:00 Uhr – Mo bis Fr",
    content:
      "Wir starten jetzt schon früher in den Tag! Frühstück mit frischen Brötchen, Rührei, Aufschnitt und Kaffee oder Tee. Das Frühstücksangebot gibt es Montag bis Freitag von 08:00 bis 11:00 Uhr. Komm vorbei!",
    image_url:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    type: "special",
    pinned: false,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Champions League live auf der großen Leinwand",
    content:
      "Alle UEFA Champions League Spiele siehst du bei uns live. Komm mit deinen Freunden, gönn dir ein kühles Bier und erlebe die besten Spiele Europas in der Werft-Atmosphäre.",
    image_url:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
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

        {/* Hero Banner */}
        <div className="relative bg-[#1A1410] overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <Image
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"
              alt="Bistro Atmosphäre"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative max-w-2xl mx-auto px-4 py-10 flex items-center gap-6">
            <Image
              src="/logo.png"
              alt="Zur Werft Logo"
              width={110}
              height={110}
              className="rounded-2xl shadow-lg flex-shrink-0"
              priority
            />
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                Bistro Zur Werft
              </h1>
              <p className="text-white/70 text-base mt-1">
                Billard-Café · Erlenbach am Main
              </p>
              <div
                className={[
                  "inline-flex items-center gap-2 mt-3 text-sm font-semibold px-3 py-1.5 rounded-lg",
                  open
                    ? "bg-green-500/20 text-green-300 border border-green-500/40"
                    : "bg-white/10 text-white/60 border border-white/20",
                ].join(" ")}
              >
                <span className={`w-2 h-2 rounded-full ${open ? "bg-green-400 animate-pulse" : "bg-white/40"}`} />
                {open ? "Heute geöffnet" : "Aktuell geschlossen"}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

          {/* Info-Zeile + Quick Actions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 w-fit card-shadow">
              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Heute: <strong className="text-[var(--color-text)]">{hours}</strong></span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/billiard">
                <Button size="md" className="gap-2">
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
