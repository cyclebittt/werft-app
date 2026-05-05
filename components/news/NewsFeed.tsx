"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NewsCard, type NewsPost } from "./NewsCard";

const FILTERS = [
  { key: "all",     label: "Alle"     },
  { key: "event",   label: "Events"   },
  { key: "sport",   label: "Sport"    },
  { key: "special", label: "Specials" },
] as const;

interface NewsFeedProps {
  posts: NewsPost[];
}

export function NewsFeed({ posts }: NewsFeedProps) {
  const [filter, setFilter] = useState<"all" | NewsPost["type"]>("all");

  const pinned  = posts.filter((p) => p.pinned);
  const regular = posts.filter(
    (p) => !p.pinned && (filter === "all" || p.type === filter)
  );

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={[
              "px-4 py-2 text-sm font-medium rounded-lg border whitespace-nowrap transition-all min-h-[40px]",
              filter === key
                ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-amber-50"
                : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {[...pinned, ...regular].map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NewsCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>

        {pinned.length === 0 && regular.length === 0 && (
          <p className="text-[var(--color-muted)] text-sm text-center py-12">
            Keine Beiträge vorhanden.
          </p>
        )}
      </div>
    </div>
  );
}
