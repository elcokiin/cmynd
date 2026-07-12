import { buttonVariants } from "@elcokiin/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@elcokiin/ui/dropdown-menu";
import { cn } from "@elcokiin/ui/lib/utils";
import {
  ExternalLinkIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";

export type InspirationItem = {
  url?: string;
  title: string;
  author?: string;
  note?: string;
  emoji: string;
};

type InspirationCardProps = {
  inspiration: InspirationItem;
  onEdit: () => void;
  onDelete: () => void;
};

function formatUrlDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    const path =
      parsed.pathname.length > 30
        ? parsed.pathname.slice(0, 30) + "..."
        : parsed.pathname;
    return `${parsed.hostname}${path}`;
  } catch {
    return url.length > 40 ? url.slice(0, 40) + "..." : url;
  }
}

export function InspirationCard({
  inspiration,
  onEdit,
  onDelete,
}: InspirationCardProps) {
  const { emoji, title, author, note, url } = inspiration;

  return (
    <div className="group relative rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3.5">
        <span className="shrink-0 pt-0.5 text-2xl leading-none">{emoji}</span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-medium">{title}</h4>
              {author && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  by {author}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "mt-0.5 h-7 w-7 shrink-0 cursor-pointer opacity-60 transition-opacity hover:opacity-100 data-open:opacity-100",
                )}
              >
                <MoreVerticalIcon className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {note && (
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground/80">
              {note}
            </p>
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-primary/60 transition-colors hover:text-primary"
            >
              <ExternalLinkIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{formatUrlDisplay(url)}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
