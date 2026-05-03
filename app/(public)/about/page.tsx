import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OPENING_HOURS } from "@/lib/utils/time";

const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Über uns</h1>
        <p className="text-[var(--color-muted)] text-sm">Bistro Zur Werft · Erlenbach am Main</p>
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Kontakt & Anfahrt
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[var(--color-muted)] mt-0.5 shrink-0" />
            <div>
              <p className="text-[var(--color-text)]">Bistro Zur Werft</p>
              <p className="text-[var(--color-muted)]">Erlenbach am Main</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
            <a href="tel:+49" className="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
              Auf Anfrage
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
            <span className="text-[var(--color-muted)]">info@zur-werft.de</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Öffnungszeiten
        </h2>
        <div className="space-y-2">
          {Object.entries(OPENING_HOURS).map(([dayIndex, hours]) => {
            const today = new Date().getDay();
            const isToday = Number(dayIndex) === today;
            return (
              <div key={dayIndex} className="flex items-center justify-between text-sm">
                <span className={isToday ? "text-[var(--color-accent)] font-medium" : "text-[var(--color-muted)]"}>
                  {DAY_NAMES[Number(dayIndex)]}
                  {isToday && " (heute)"}
                </span>
                <span className={isToday ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"}>
                  {hours ? `${hours.open} – ${hours.close || "00:00"} Uhr` : "Geschlossen"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Das Bistro
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Das Bistro Zur Werft ist dein Treffpunkt in Erlenbach am Main. Ob nach der Arbeit, am Wochenende
          oder für ein sportliches Billard-Match – bei uns bist du richtig. Frühstück, Mittagstisch,
          Cocktails und natürlich Billard an 6 Tischen.
        </p>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Mit unserer Loyalty-App sammelst du bei jedem Besuch Punkte und sicherst dir exklusive Prämien.
        </p>
      </Card>
    </div>
  );
}
