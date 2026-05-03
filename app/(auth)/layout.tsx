import { Anchor } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">
        <Anchor className="w-5 h-5 text-[var(--color-accent)]" />
        <span className="text-sm font-bold uppercase tracking-widest">Zur Werft</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
