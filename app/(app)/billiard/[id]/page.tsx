import { createClient } from "@/lib/supabase/server";
import { ActiveTimer } from "@/components/billiard/ActiveTimer";
import { redirect } from "next/navigation";

export default async function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tableId = parseInt(id, 10);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: booking } = await supabase
    .from("billiard_bookings")
    .select("*")
    .eq("table_id", tableId)
    .eq("status", "active")
    .maybeSingle();

  if (!booking) redirect("/billiard");

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <ActiveTimer
        bookingId={booking.id}
        tableId={tableId}
        startTime={booking.start_time}
        userId={user?.id}
        onEnd={() => {}}
      />
    </div>
  );
}
