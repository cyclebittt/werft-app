import { formatDateTime } from "@/lib/utils/time";

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

const reasonLabels: Record<string, string> = {
  billiard_booking: "Billard gebucht",
  billiard_session: "Billard gespielt",
  daily_checkin: "Täglicher Check-in",
  table_reservation: "Tisch reserviert",
  drink: "Getränk",
};

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return <p className="text-[var(--color-muted)] text-sm text-center py-6">Noch keine Aktivitäten.</p>;
  }

  return (
    <div className="space-y-0 divide-y divide-[var(--color-border)]">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm text-[var(--color-text)]">
              {reasonLabels[tx.reason] ?? tx.reason}
            </p>
            <p className="text-xs text-[var(--color-muted)]">{formatDateTime(tx.created_at)}</p>
          </div>
          <span className={[
            "font-mono font-medium text-sm",
            tx.amount > 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]",
          ].join(" ")}>
            {tx.amount > 0 ? "+" : ""}{tx.amount}
          </span>
        </div>
      ))}
    </div>
  );
}
