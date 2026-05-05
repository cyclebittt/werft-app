import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";

// Dieser Layout-Wrapper ist für Seiten die öffentlich zugänglich sind,
// aber Navbar/BottomNav benötigen. Auth-Check passiert in den einzelnen
// Seiten (dashboard, loyalty, profile) oder via proxy.ts.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </>
  );
}
