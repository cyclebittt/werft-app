import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils/formatters";

export const revalidate = 300;

interface MenuItem {
  id: string;
  category_id?: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[];
  available: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  emoji: string;
  items: MenuItem[];
}

// Demo-Menü – wird durch Supabase-Daten ersetzt sobald konfiguriert
const DEMO_MENU: MenuCategory[] = [
  {
    id: "fruehstueck",
    name: "Frühstück",
    emoji: "🌅",
    items: [
      {
        id: "f1",
        name: "Werft-Frühstück",
        description: "2 Brötchen, 2 Scheiben Aufschnitt, Butter, Marmelade, Kaffee oder Tee",
        price: 7.90,
        allergens: ["Gluten", "Laktose"],
        available: true,
      },
      {
        id: "f2",
        name: "Rührei mit Speck",
        description: "3 Eier, knuspriger Speck, Toastbrot, Butter",
        price: 9.50,
        allergens: ["Gluten", "Eier"],
        available: true,
      },
      {
        id: "f3",
        name: "Müsli mit Joghurt",
        description: "Haferflocken, frische Früchte, Naturjoghurt, Honig",
        price: 6.50,
        allergens: ["Laktose", "Gluten"],
        available: true,
      },
      {
        id: "f4",
        name: "Avocado Toast",
        description: "Sauerteigbrot, Avocado, Chili-Flocken, Limette, Microgreens",
        price: 10.50,
        allergens: ["Gluten"],
        available: true,
      },
    ],
  },
  {
    id: "mittag",
    name: "Mittagstisch",
    emoji: "🍽️",
    items: [
      {
        id: "m1",
        name: "Schnitzel mit Pommes",
        description: "Paniertes Schweineschnitzel, hausgemachte Pommes frites, Beilagensalat",
        price: 13.90,
        allergens: ["Gluten", "Eier"],
        available: true,
      },
      {
        id: "m2",
        name: "Currywurst mit Pommes",
        description: "Bratwurst in Currysoße, Pommes frites",
        price: 10.50,
        allergens: ["Gluten", "Senf"],
        available: true,
      },
      {
        id: "m3",
        name: "Pasta Bolognese",
        description: "Spaghetti mit hausgemachter Fleischsoße, Parmesan",
        price: 11.90,
        allergens: ["Gluten", "Laktose", "Eier"],
        available: true,
      },
      {
        id: "m4",
        name: 'Burger "Zur Werft"',
        description: "180 g Beef Patty, Cheddar, karamellisierte Zwiebeln, Werft-Soße, Brioche-Bun, Coleslaw",
        price: 14.90,
        allergens: ["Gluten", "Laktose", "Eier", "Sesam"],
        available: true,
      },
      {
        id: "m5",
        name: "Tagessuppe",
        description: "Fragen Sie unser Personal nach der Tagessuppe",
        price: 5.50,
        allergens: [],
        available: true,
      },
    ],
  },
  {
    id: "snacks",
    name: "Snacks & Beilagen",
    emoji: "🍟",
    items: [
      {
        id: "s1",
        name: "Pommes frites",
        description: "Knusprige Pommes, Ketchup oder Mayonnaise",
        price: 4.50,
        allergens: ["Gluten"],
        available: true,
      },
      {
        id: "s2",
        name: "Nachos mit Dips",
        description: "Tortilla-Chips, Guacamole, Salsa, Sour Cream",
        price: 7.90,
        allergens: ["Laktose", "Gluten"],
        available: true,
      },
      {
        id: "s3",
        name: "Mozzarella Sticks (6 Stk.)",
        description: "Panierter Mozzarella, Marinara-Soße",
        price: 6.90,
        allergens: ["Gluten", "Laktose", "Eier"],
        available: true,
      },
      {
        id: "s4",
        name: "Chicken Wings (6 Stk.)",
        description: "BBQ oder Buffalo, Blue-Cheese-Dip",
        price: 8.90,
        allergens: ["Gluten", "Laktose"],
        available: true,
      },
    ],
  },
  {
    id: "softdrinks",
    name: "Softdrinks & Kaffee",
    emoji: "☕",
    items: [
      {
        id: "d1",
        name: "Espresso",
        description: null,
        price: 2.20,
        allergens: [],
        available: true,
      },
      {
        id: "d2",
        name: "Cappuccino",
        description: null,
        price: 3.20,
        allergens: ["Laktose"],
        available: true,
      },
      {
        id: "d3",
        name: "Coca-Cola / Fanta / Sprite",
        description: "0,33 l Flasche",
        price: 2.90,
        allergens: [],
        available: true,
      },
      {
        id: "d4",
        name: "Wasser still oder sprudelnd",
        description: "0,5 l Flasche",
        price: 2.50,
        allergens: [],
        available: true,
      },
      {
        id: "d5",
        name: "Orangensaft frisch gepresst",
        description: "0,3 l",
        price: 4.50,
        allergens: [],
        available: true,
      },
    ],
  },
  {
    id: "bier",
    name: "Bier & Wein",
    emoji: "🍺",
    items: [
      {
        id: "b1",
        name: "Werft Pils vom Fass",
        description: "0,3 l",
        price: 3.20,
        allergens: ["Gluten"],
        available: true,
      },
      {
        id: "b2",
        name: "Werft Pils vom Fass",
        description: "0,5 l",
        price: 4.50,
        allergens: ["Gluten"],
        available: true,
      },
      {
        id: "b3",
        name: "Hefeweizen",
        description: "0,5 l Flasche",
        price: 4.20,
        allergens: ["Gluten"],
        available: true,
      },
      {
        id: "b4",
        name: "Hauswein (Weiß / Rosé / Rot)",
        description: "0,2 l Glas",
        price: 4.80,
        allergens: ["Sulfite"],
        available: true,
      },
      {
        id: "b5",
        name: "Alkoholfreies Bier",
        description: "0,33 l Flasche",
        price: 3.50,
        allergens: ["Gluten"],
        available: true,
      },
    ],
  },
  {
    id: "cocktails",
    name: "Cocktails & Longdrinks",
    emoji: "🍹",
    items: [
      {
        id: "c1",
        name: "Werft Sour",
        description: "Bourbon, frischer Zitronensaft, Zuckersirup, Angostura",
        price: 9.50,
        allergens: [],
        available: true,
      },
      {
        id: "c2",
        name: "Mojito",
        description: "Weißer Rum, Minze, Limette, Rohrzucker, Soda",
        price: 9.00,
        allergens: [],
        available: true,
      },
      {
        id: "c3",
        name: "Hugo",
        description: "Prosecco, Holunderblütensirup, Minze, Soda, Limette",
        price: 8.50,
        allergens: ["Sulfite"],
        available: true,
      },
      {
        id: "c4",
        name: "Gin Tonic",
        description: "Gin nach Wahl, Premium Tonic, Garnish",
        price: 10.00,
        allergens: [],
        available: true,
      },
      {
        id: "c5",
        name: "Aperol Spritz",
        description: "Aperol, Prosecco, Soda, Orange",
        price: 8.00,
        allergens: ["Sulfite"],
        available: true,
      },
      {
        id: "c6",
        name: "Virgin Mojito (Alkoholfrei)",
        description: "Limette, Minze, Rohrzucker, Soda",
        price: 6.50,
        allergens: [],
        available: true,
      },
    ],
  },
];

async function fetchMenu(): Promise<MenuCategory[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return DEMO_MENU;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [{ data: cats }, { data: items }] = await Promise.all([
      supabase.from("menu_categories").select("*").order("sort"),
      supabase.from("menu_items").select("*").order("sort"),
    ]);

    if (!cats?.length) return DEMO_MENU;

    return (cats as Array<{ id: string; name: string }>).map((cat) => ({
      id: cat.id,
      name: cat.name,
      emoji: "",
      items: ((items ?? []) as MenuItem[]).filter((i) => i.category_id === cat.id),
    })) as MenuCategory[];
  } catch {
    return DEMO_MENU;
  }
}

export default async function MenuPage() {
  const menu = await fetchMenu();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-1">Speisekarte</h1>
        <p className="text-[var(--color-muted)] text-base">Bistro Zur Werft · Erlenbach am Main</p>
      </div>

      {/* Kategorien-Sprung-Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-10 -mx-4 px-4">
        {menu.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="flex-shrink-0 text-sm font-medium px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors whitespace-nowrap card-shadow"
          >
            {cat.emoji} {cat.name}
          </a>
        ))}
      </div>

      <div className="space-y-14">
        {menu.map((cat) => (
          <section key={cat.id} id={cat.id}>
            {/* Category heading */}
            <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-[var(--color-accent)]">
              {cat.emoji && <span className="text-2xl">{cat.emoji}</span>}
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                {cat.name}
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-border)] card-shadow overflow-hidden">
              {cat.items.map((item, i) => (
                <div
                  key={item.id}
                  className={[
                    "flex items-start justify-between gap-4 px-5 py-4",
                    i < cat.items.length - 1 ? "border-b border-[var(--color-border)]" : "",
                    !item.available ? "opacity-50" : "",
                  ].join(" ")}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className={`text-base font-semibold ${
                          item.available
                            ? "text-[var(--color-text)]"
                            : "text-[var(--color-muted)] line-through"
                        }`}
                      >
                        {item.name}
                      </span>
                      {!item.available && (
                        <Badge variant="default" size="sm">Heute nicht verfügbar</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.allergens.map((a) => (
                          <span
                            key={a}
                            className="text-xs px-2 py-0.5 border border-[var(--color-border)] rounded-md text-[var(--color-muted)] bg-[var(--color-surface-2)]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-base text-[var(--color-accent)] whitespace-nowrap mt-0.5 tabular-nums">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 pt-6 border-t border-[var(--color-border)]">
        <p className="text-sm text-[var(--color-muted)] text-center leading-relaxed">
          Alle Preise inkl. MwSt. · Änderungen vorbehalten<br />
          Bei Allergien sprechen Sie bitte unser Personal an.
        </p>
      </div>
    </div>
  );
}
