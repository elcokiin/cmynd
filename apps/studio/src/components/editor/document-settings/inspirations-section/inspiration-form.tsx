import { buttonVariants } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { cn } from "@elcokiin/ui/lib/utils";
import { Textarea } from "@elcokiin/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

const RANDOM_EMOJIS = [
  "📚", "🎨", "💡", "✨", "🖋️", "🎵", "🎬", "📖", "🎯", "🌟",
  "🔥", "💭", "🎭", "📷", "🎶", "🪄", "🧠", "👁️", "🌿", "⚡",
  "💫", "🕯️", "🏛️", "🎧", "🎪", "🗺️", "🧩", "🎲", "🏆", "📜",
  "🌈", "🎀", "💎", "🪐", "🌊", "🍃", "🔮", "🎻", "🥁", "🎺",
  "🖼️", "🗿", "🌋", "🎡", "🎠", "🧬", "🔭", "🧭", "📡", "🎛️",
  "⚗️", "🧿", "🪷", "🌙", "☀️", "⭐",
];

const ADJECTIVES = [
  "Abstract", "Ancient", "Autumn", "Blinding", "Burning", "Calm",
  "Crimson", "Cosmic", "Crystal", "Deep", "Distant", "Echoing",
  "Eternal", "Fading", "Falling", "Flowing", "Golden", "Hidden",
  "Infinite", "Liquid", "Luminous", "Melting", "Midnight", "Misty",
  "Quiet", "Radiant", "Rusted", "Shattered", "Silent", "Silver",
  "Strange", "Subtle", "Thunder", "Velvet", "Whispering", "Wild",
];

const NOUNS = [
  "Echo", "Shadow", "Dream", "Light", "Wave", "Fire",
  "Horizon", "Memory", "Storm", "River", "Cloud", "Signal",
  "Pulse", "Glow", "Mirror", "Garden", "Ocean", "Spiral",
  "Fragment", "Breath", "Moment", "Origin", "Vessel", "Bloom",
  "Drift", "Hollow", "Prism", "Lantern", "Ember", "Tide",
  "Veil", "Core", "Flux", "Nexus", "Mirage", "Echo",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomEmoji(): string {
  return pick(RANDOM_EMOJIS);
}

function generateRandomTitle(): string {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}

export type InspirationFormValues = {
  emoji: string;
  title: string;
  url: string;
  author: string;
  note: string;
};

type InspirationFormProps = {
  initialValues?: InspirationFormValues;
  onSave: (values: InspirationFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
};

export function InspirationForm({
  initialValues,
  onSave,
  onCancel,
  submitLabel = "Add Inspiration",
}: InspirationFormProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const form = useForm({
    defaultValues: initialValues ?? {
      emoji: getRandomEmoji(),
      title: "",
      url: "",
      author: "",
      note: "",
    },
    onSubmit: async ({ value }) => {
      const title = value.title.trim() || generateRandomTitle();
      onSave({ ...value, title });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="rounded-xl border bg-muted/20 p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <form.Field name="emoji">
            {(field) => (
              <span className="select-none text-2xl leading-none">
                {field.state.value}
              </span>
            )}
          </form.Field>
          <button
            type="button"
            onClick={() => form.setFieldValue("emoji", getRandomEmoji())}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "cursor-pointer opacity-50 transition-opacity hover:opacity-100",
            )}
            title="Random emoji"
          >
            🎲
          </button>
        </div>
        <div className="flex-1">
          <form.Field name="title">
            {(field) => (
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="What inspired you?"
                className="h-9 border-0 bg-transparent px-0 text-base font-medium shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
                autoFocus
              />
            )}
          </form.Field>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen(!detailsOpen)}
        className="mb-3 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRightIcon
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            detailsOpen && "rotate-90",
          )}
        />
        More details
      </button>

      {detailsOpen && (
        <div className="mb-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">URL</Label>
            <form.Field name="url">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://example.com/article"
                  type="url"
                />
              )}
            </form.Field>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Author</Label>
            <form.Field name="author">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Name of the author"
                />
              )}
            </form.Field>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Note</Label>
            <form.Field name="note">
              {(field) => (
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Why was this inspiring?"
                  className="min-h-[60px]"
                />
              )}
            </form.Field>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "cursor-pointer",
          )}
        >
          Cancel
        </button>
        <form.Subscribe>
          {(state) => (
            <button
              type="submit"
              disabled={state.isSubmitting}
              className={cn(buttonVariants({ size: "sm" }), "cursor-pointer")}
            >
              {state.isSubmitting ? "Saving..." : submitLabel}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
