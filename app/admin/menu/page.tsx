"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils/formatters";
import { Plus } from "lucide-react";

interface Category { id: string; name: string; sort: number; }
interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[];
  available: boolean;
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addCat, setAddCat] = useState("");
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const [{ data: cats }, { data: its }] = await Promise.all([
      supabase.from("menu_categories").select("*").order("sort"),
      supabase.from("menu_items").select("*").order("sort"),
    ]);
    setCategories((cats ?? []) as Category[]);
    setItems((its ?? []) as MenuItem[]);
  }

  useEffect(() => { load(); }, []);

  async function toggleAvailable(item: MenuItem) {
    const supabase = createClient();
    await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, available: !i.available } : i));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from("menu_items").insert({
      category_id: addCat,
      name: addName,
      description: addDesc || null,
      price: parseFloat(addPrice),
    });
    setShowAdd(false);
    setAddName(""); setAddDesc(""); setAddPrice("");
    await load();
    setSaving(false);
  }

  const grouped = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category_id === cat.id),
  }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Speisekarte</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="w-4 h-4" />
          Gericht hinzufügen
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <select
              required
              value={addCat}
              onChange={(e) => setAddCat(e.target.value)}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">Kategorie wählen…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input required value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Name" className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]" />
              <input required value={addPrice} onChange={(e) => setAddPrice(e.target.value)} type="number" step="0.01" min="0" placeholder="Preis (€)" className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]" />
            </div>
            <input value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="Beschreibung (optional)" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]" />
            <div className="flex gap-2">
              <Button type="submit" loading={saving} size="sm">Speichern</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Abbrechen</Button>
            </div>
          </form>
        </Card>
      )}

      {grouped.map((cat) => (
        <section key={cat.id}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-3 pb-2 border-b border-[var(--color-border)]">
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px]">
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${item.available ? "text-[var(--color-text)]" : "text-[var(--color-muted)] line-through"}`}>
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-sm text-[var(--color-accent)] shrink-0">
                  {formatPrice(item.price)}
                </span>
                <button
                  onClick={() => toggleAvailable(item)}
                  className={[
                    "text-xs px-2.5 py-1 rounded-[2px] border transition-colors shrink-0",
                    item.available
                      ? "border-[var(--color-success)] text-[var(--color-success)] hover:bg-green-950"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]",
                  ].join(" ")}
                >
                  {item.available ? "Verfügbar" : "Nicht verfügbar"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
