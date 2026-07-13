import { useEffect, useMemo, useState } from "react";

import { buttonVariants } from "../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
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

  useEffect(() => {
    import("../editor/utils/emoji-list").then((m) =>
      setEmojis(m.default as EmojiItem[]),
    );
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, EmojiItem[]>();
    for (const e of emojis) {
      let list = map.get(e.category);
      if (!list) {
        list = [];
        map.set(e.category, list);
      }
      list.push(e);
    }
    return map;
  }, [emojis]);

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
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search emoji..." autoFocus />
          <CommandList>
            <CommandEmpty>No emoji found</CommandEmpty>
            {emojis.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Loading...
              </div>
            )}
            {Array.from(grouped.entries()).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((e) => (
                  <CommandItem
                    key={e.emoji}
                    value={`${e.emoji} ${e.aliases.join(" ")} ${e.tags.join(" ")} ${e.description} ${e.category}`}
                    onSelect={() => {
                      onChange(e.emoji);
                      setOpen(false);
                    }}
                  >
                    <span className="text-lg leading-none">{e.emoji}</span>
                    <span className="text-xs text-muted-foreground">
                      :{e.aliases[0]}:
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
