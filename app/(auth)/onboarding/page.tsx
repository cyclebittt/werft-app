"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Bitte gib deinen Namen ein."); return; }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet.");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: name.trim(),
        phone: phone.trim() || null,
      });
      if (error) throw error;

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text)]">Willkommen!</h1>
        <p className="text-[var(--color-muted)] text-sm mt-1">
          Kurz noch deinen Namen und du kannst loslegen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">Dein Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vorname Nachname"
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">
            Telefonnummer <span className="text-[var(--color-muted)]">(optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+49 ..."
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {error && <p className="text-[var(--color-danger)] text-xs">{error}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Loslegen
        </Button>
      </form>
    </div>
  );
}
