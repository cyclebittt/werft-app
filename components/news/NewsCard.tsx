import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pin } from "lucide-react";
import { formatDate } from "@/lib/utils/time";

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  type: "general" | "event" | "special" | "sport";
  pinned: boolean;
  published_at: string;
}

const typeLabels: Record<NewsPost["type"], { label: string; variant: "default" | "success" | "warning" | "danger" }> = {
  general: { label: "Allgemein", variant: "default" },
  event: { label: "Event", variant: "warning" },
  special: { label: "Special", variant: "success" },
  sport: { label: "Sport", variant: "danger" },
};

interface NewsCardProps {
  post: NewsPost;
}

export function NewsCard({ post }: NewsCardProps) {
  const type = typeLabels[post.type];

  return (
    <Card className="overflow-hidden">
      {post.image_url && (
        <div className="aspect-[16/7] overflow-hidden">
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover opacity-80" />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={type.variant}>{type.label}</Badge>
          {post.pinned && <Pin className="w-3 h-3 text-[var(--color-accent)]" />}
          <span className="text-[var(--color-muted)] text-xs ml-auto">{formatDate(post.published_at)}</span>
        </div>
        <h3 className="font-semibold text-[var(--color-text)] leading-snug">{post.title}</h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">{post.content}</p>
      </div>
    </Card>
  );
}
