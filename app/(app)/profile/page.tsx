"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LevelBadge } from "@/components/loyalty/LevelBadge";
import { useRouter } from "next/navigation";
import type { Level } from "@/lib/utils/points";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ name: string; phone: string; points: number; level: Level } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("profiles").update({ name, phone: phone || null }).eq("id", user!.id);
    setMessage("Gespeichert!");
    setSaving(false);
    setTimeout(() => setMessage(""), 2000);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDelete() {
    if (!confirm("Wirklich alle Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    setDeleting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("point_transactions").delete().eq("user_id", user.id);
      await supabase.from("billiard_bookings").update({ user_id: null }).eq("user_id", user.id);
      await supabase.from("table_reservations").update({ user_id: null }).eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
    }
    router.push("/");
    setDeleting(false);
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Profil</h1>
        <LevelBadge level={profile.level} />
      </div>

      <form onSubmit={handleSave} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] p-5 space-y-4">
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        {message && <p className="text-[var(--color-success)] text-xs">{message}</p>}
        <Button type="submit" loading={saving} className="w-full">Speichern</Button>
      </form>

      <div className="space-y-3">
        <Button variant="secondary" onClick={handleLogout} className="w-full">
          Abmelden
        </Button>
        <Button variant="ghost" onClick={handleDelete} loading={deleting} className="w-full text-[var(--color-danger)] hover:text-[var(--color-danger)]">
          Konto & Daten löschen (DSGVO)
        </Button>
      </div>

      <div className="text-xs text-[var(--color-muted)] space-y-1 pt-4 border-t border-[var(--color-border)]">
        <p><a href="#" className="hover:text-[var(--color-accent)]">Datenschutzerklärung</a></p>
        <p><a href="#" className="hover:text-[var(--color-accent)]">Impressum</a></p>
      </div>
    </div>
  );
}
