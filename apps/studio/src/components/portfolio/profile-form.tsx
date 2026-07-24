import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { SaveIcon, ImageIcon, UserIcon, FileTextIcon, LightbulbIcon } from "lucide-react";
import { InputWithIcon, TextareaWithIcon } from "@/components/ui/input-with-icon";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { normalizeOptionalText } from "@/lib/text";
import { SocialLinksField } from "./social-links-field";
import { HobbiesField } from "./hobbies-field";
import { PlaylistField } from "./playlist-field";
import { toast } from "sonner";

import type { AdminPortfolio } from "@elcokiin/backend/lib/types/portfolio";

const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  label: z.string().optional(),
});

const hobbySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
});

const songSchema = z.object({
  title: z.string(),
  artist: z.string(),
  youtubeId: z.string().optional(),
});

const playlistSchema = z.object({
  spotifyPlaylistId: z.string().optional(),
  songs: z.array(songSchema).optional(),
});

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headline: z.string().optional(),
  avatarUrl: z.string().optional(),
  about: z.string().optional(),
  philosophy: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional().default([]),
  hobbies: z.array(hobbySchema).optional().default([]),
  playlist: playlistSchema.optional().default({ spotifyPlaylistId: "", songs: [] }),
});

interface ProfileFormProps {
  portfolio: AdminPortfolio;
}

export function ProfileForm({ portfolio }: ProfileFormProps) {
  const { handleError } = useErrorHandler();
  const updateProfile = useMutation(api.portfolio.mutations.updateProfile);

  const form = useForm({
    defaultValues: {
      name: portfolio.name ?? "",
      headline: portfolio.headline ?? "",
      avatarUrl: portfolio.avatarUrl ?? "",
      about: portfolio.about ?? "",
      philosophy: portfolio.philosophy ?? "",
      socialLinks: portfolio.socialLinks ?? [],
      hobbies: portfolio.hobbies ?? [],
      playlist: portfolio.playlist ?? { spotifyPlaylistId: "", songs: [] },
    },
    validators: {
      onSubmit: profileSchema as any,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateProfile({
          name: value.name,
          headline: value.headline || undefined,
          avatarUrl: normalizeOptionalText(value.avatarUrl ?? ""),
          about: normalizeOptionalText(value.about ?? ""),
          philosophy: normalizeOptionalText(value.philosophy ?? ""),
          socialLinks: value.socialLinks && value.socialLinks.length > 0
            ? value.socialLinks
            : undefined,
          hobbies: value.hobbies && value.hobbies.length > 0
            ? value.hobbies
            : undefined,
          playlist: value.playlist?.spotifyPlaylistId || (value.playlist?.songs && value.playlist.songs.length > 0)
            ? {
                spotifyPlaylistId: value.playlist?.spotifyPlaylistId || undefined,
                songs: value.playlist?.songs && value.playlist.songs.length > 0
                  ? value.playlist.songs.map((s) => ({
                      title: s.title,
                      artist: s.artist,
                      youtubeId: normalizeOptionalText(s.youtubeId ?? ""),
                    }))
                  : undefined,
              }
            : undefined,
        });
        toast.success("Profile updated");
      } catch (error) {
        handleError(error, { context: "ProfileForm.onSubmit" });
      }
    },
  });

  useEffect(() => {
    form.reset();
  }, [portfolio]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      onReset={() => form.reset()}
    >
      <div className="grid gap-6">
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Name</Label>
              <InputWithIcon
                icon={<UserIcon />}
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Your name"
                required
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="headline">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Headline</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Full-Stack Developer"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="avatarUrl">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Avatar URL</Label>
              <div className="flex items-center gap-3">
                {field.state.value?.trim() && (
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
                    <img
                      src={field.state.value.trim()}
                      alt="Preview"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <InputWithIcon
                  icon={<ImageIcon />}
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                  className="flex-1"
                />
              </div>
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="about">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>About (Markdown)</Label>
              <TextareaWithIcon
                icon={<FileTextIcon />}
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Write about yourself..."
                rows={5}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="philosophy">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Philosophy (Markdown)</Label>
              <TextareaWithIcon
                icon={<LightbulbIcon />}
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Your philosophy..."
                rows={4}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="socialLinks">
          {(field) => (
            <SocialLinksField
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <form.Field name="hobbies">
          {(field) => (
            <HobbiesField
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <form.Field name="playlist">
          {(field) => (
            <PlaylistField
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                type="reset"
                disabled={state.isSubmitting}
              >
                Reset
              </Button>
              <Button type="submit" disabled={state.isSubmitting}>
                <SaveIcon className="h-4 w-4 mr-1" />
                {state.isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
