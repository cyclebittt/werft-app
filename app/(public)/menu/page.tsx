import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils/formatters";

export const revalidate = 300;

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[];
  available: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  sort: number;
}

export default async function MenuPage() {
  const supabase = await createClient();

  const { data: categoriesRaw } = await supabase
    .from("menu_categories")
    .select("*")
    .order("sort");

  const { data: itemsRaw } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort");

  const categories = (categoriesRaw ?? []) as MenuCategory[];
  const items = (itemsRaw ?? []) as MenuItem[];

  const grouped = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category_id === cat.id),
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Speisekarte</h1>
      <p className="text-[var(--color-muted)] text-sm mb-8">Bistro Zur Werft · Erlenbach am Main</p>

      <div className="space-y-10">
        {grouped.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-4 pb-2 border-b border-[var(--color-border)]">
              {cat.name}
            </h2>
            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className={[
                    "flex items-start justify-between gap-4 py-3 border-b border-[var(--color-border)]",
                    !item.available ? "opacity-40" : "",
                  ].join(" ")}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[var(--color-text)]">{item.name}</span>
                      {!item.available && (
                        <Badge variant="default" size="sm">Heute nicht verfügbar</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.allergens?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.allergens.map((a) => (
                          <Badge key={a} size="sm" variant="default">{a}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-sm text-[var(--color-accent)] whitespace-nowrap mt-0.5">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
              {cat.items.length === 0 && (
                <p className="text-xs text-[var(--color-muted)] py-2">Keine Einträge.</p>
              )}
            </div>
          </section>
        ))}

        {grouped.length === 0 && (
          <p className="text-[var(--color-muted)] text-sm text-center py-16">
            Die Speisekarte wird gerade aktualisiert.
          </p>
        )}
      </div>
    </div>
  );
}
