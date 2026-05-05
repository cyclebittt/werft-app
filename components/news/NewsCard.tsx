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

const typeLabels: Record<
  NewsPost["type"],
  { label: string; variant: "default" | "success" | "warning" | "danger" }
> = {
  general: { label: "Allgemein", variant: "default"  },
  event:   { label: "Event",     variant: "warning"  },
  special: { label: "Special",   variant: "success"  },
  sport:   { label: "Sport",     variant: "danger"   },
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
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={type.variant}>{type.label}</Badge>
          {post.pinned && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-accent)] font-medium">
              <Pin className="w-3.5 h-3.5" />
              Angeheftet
            </span>
          )}
          <span className="text-[var(--color-muted)] text-sm ml-auto">
            {formatDate(post.published_at)}
          </span>
        </div>
        <h3 className="text-lg font-bold text-[var(--color-text)] leading-snug">
          {post.title}
        </h3>
        <p className="text-base text-[var(--color-muted)] leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>
    </Card>
  );
}
