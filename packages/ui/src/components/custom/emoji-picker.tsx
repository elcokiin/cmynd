import { useEffect, useMemo, useRef, useState } from "react";

import { buttonVariants } from "../button";
import { Input } from "../input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../popover";
import { cn } from "../../lib/utils";

type EmojiItem = {
  emoji: string;
  description: string;
  category: string;
  aliases: string[];
  tags: string[];
};

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
};

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    import("../editor/utils/emoji-list").then((m) =>
      setEmojis(m.default as EmojiItem[]),
    );
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [open]);

  const itemsWithSearchValue = useMemo(
    () =>
      emojis.map((e) => ({
        ...e,
        searchValue: `${e.emoji} ${e.aliases.join(" ")} ${e.tags.join(" ")} ${e.description} ${e.category}`.toLowerCase(),
      })),
    [emojis],
  );

  const filteredGrouped = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    const map = new Map<string, EmojiItem[]>();

    for (const e of itemsWithSearchValue) {
      if (query && !e.searchValue.includes(query)) continue;
      let list = map.get(e.category);
      if (!list) {
        list = [];
        map.set(e.category, list);
      }
      list.push(e);
    }
    return map;
  }, [itemsWithSearchValue, debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "cursor-pointer text-2xl leading-none",
            )}
          />
        }
      >
        {value}
      </PopoverTrigger>
      <PopoverContent className="w-80 border p-3" align="start">
        <Input
          ref={inputRef}
          placeholder="Search emoji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        {emojis.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Loading...
          </div>
        )}
        {filteredGrouped.size === 0 && emojis.length > 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No emoji found
          </div>
        )}
        <div className="no-scrollbar max-h-72 overflow-y-auto">
          {Array.from(filteredGrouped.entries()).map(([category, items]) => (
            <div key={category} className="mb-2">
              <div className="px-1 py-0.5 text-xs text-muted-foreground">
                {category}
              </div>
              <div className="grid grid-cols-8 gap-0">
                {items.map((e) => (
                  <button
                    key={e.emoji}
                    type="button"
                    onClick={() => {
                      onChange(e.emoji);
                      setOpen(false);
                    }}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-none text-lg leading-none transition-colors hover:bg-muted"
                    title={`:${e.aliases[0]}:`}
                  >
                    {e.emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
