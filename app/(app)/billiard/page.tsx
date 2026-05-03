"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TableGrid } from "@/components/billiard/TableGrid";
import { BookingForm } from "@/components/billiard/BookingForm";
import { useUserPoints } from "@/lib/hooks/useUserPoints";
import { X } from "lucide-react";

export default function BilliardPage() {
  const { profile } = useUserPoints();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  function handleSuccess() {
    setSuccess(selectedTable);
    setSelectedTable(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Billard</h1>
        <p className="text-[var(--color-muted)] text-sm mt-1">
          6 Tische · Realtime-Status · Punkte sammeln
        </p>
      </div>

      {success !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-950 border border-green-800 rounded-[2px] px-4 py-3 text-sm text-[var(--color-success)] flex items-center justify-between"
        >
          <span>Tisch {success} erfolgreich gebucht!</span>
          <button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
        </motion.div>
      )}

      <TableGrid onTableClick={setSelectedTable} />

      <AnimatePresence>
        {selectedTable !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedTable(null)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[var(--color-text)]">Tisch {selectedTable} buchen</h2>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <BookingForm
                tableId={selectedTable}
                userId={profile?.id}
                userName={profile?.name}
                onSuccess={handleSuccess}
                onCancel={() => setSelectedTable(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
