"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pin, PinOff, Trash2 } from "lucide-react";
import type { NewsPost } from "@/components/news/NewsCard";

const typeOptions = [
  { value: "general", label: "Allgemein" },
  { value: "event", label: "Event" },
  { value: "special", label: "Special" },
  { value: "sport", label: "Sport" },
];

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<NewsPost["type"]>("general");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPosts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("news_posts")
      .select("*")
      .order("published_at", { ascending: false });
    setPosts((data ?? []) as NewsPost[]);
  }

  useEffect(() => { loadPosts(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from("news_posts").insert({
      title,
      content,
      type,
      image_url: imageUrl || null,
    });
    setTitle(""); setContent(""); setImageUrl("");
    await loadPosts();
    setSaving(false);
  }

  async function togglePin(post: NewsPost) {
    const supabase = createClient();
    await supabase.from("news_posts").update({ pinned: !post.pinned }).eq("id", post.id);
    await loadPosts();
  }

  async function deletePost(id: string) {
    if (!confirm("Beitrag löschen?")) return;
    const supabase = createClient();
    await supabase.from("news_posts").delete().eq("id", id);
    await loadPosts();
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-xl font-bold text-[var(--color-text)]">News verwalten</h1>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Neuer Beitrag</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NewsPost["type"])}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              >
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Bild-URL (optional)"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div className="col-span-2">
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Inhalt"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[2px] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
              />
            </div>
          </div>
          <Button type="submit" loading={saving}>Veröffentlichen</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default" size="sm">{typeOptions.find(o => o.value === post.type)?.label}</Badge>
                  {post.pinned && <Pin className="w-3 h-3 text-[var(--color-accent)]" />}
                  <h3 className="font-medium text-[var(--color-text)] text-sm">{post.title}</h3>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2">{post.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePin(post)}
                  className="p-1.5 rounded-[2px] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                  title={post.pinned ? "Unpin" : "Pinnen"}
                >
                  {post.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 rounded-[2px] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
