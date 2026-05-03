"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); }
      else { setSuccess("Bitte bestätige deine E-Mail-Adresse."); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("E-Mail oder Passwort falsch."); }
      else { router.push("/dashboard"); router.refresh(); }
    }

    setLoading(false);
  }

  async function handleMagicLink() {
    if (!email) { setError("Bitte E-Mail eingeben."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setSuccess("Magic Link wurde gesendet – prüfe deine E-Mails.");
    setLoading(false);
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          {mode === "login" ? "Anmelden" : "Registrieren"}
        </h1>
        <p className="text-[var(--color-muted)] text-sm mt-1">
          {mode === "login" ? "Melde dich mit deinem Konto an." : "Erstelle ein neues Konto."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">E-Mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1">Passwort</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {error && <p className="text-[var(--color-danger)] text-xs">{error}</p>}
        {success && <p className="text-[var(--color-success)] text-xs">{success}</p>}

        <Button type="submit" loading={loading} className="w-full">
          {mode === "login" ? "Anmelden" : "Konto erstellen"}
        </Button>
      </form>

      <div className="relative">
        <div className="border-t border-[var(--color-border)]" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-surface)] px-2 text-xs text-[var(--color-muted)]">
          oder
        </span>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={handleMagicLink}
        loading={loading}
        className="w-full"
        size="sm"
      >
        Magic Link senden
      </Button>

      <p className="text-xs text-[var(--color-muted)] text-center">
        {mode === "login" ? "Noch kein Konto?" : "Bereits registriert?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-[var(--color-accent)] hover:underline"
        >
          {mode === "login" ? "Registrieren" : "Anmelden"}
        </button>
      </p>
    </div>
  );
}
