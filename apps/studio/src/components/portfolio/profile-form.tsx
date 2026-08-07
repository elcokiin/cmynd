import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Separator } from "@elcokiin/ui/separator";
import { SaveIcon, UserIcon, FileTextIcon, LightbulbIcon, TagIcon } from "lucide-react";
import { InputWithIcon, TextareaWithIcon } from "@/components/ui/input-with-icon";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { normalizeOptionalText } from "@/lib/text";
import { AvatarField } from "./avatar-field";
import { SocialLinksField } from "./social-links-field";
import { HobbiesField } from "./hobbies-field";
import { PlaylistField } from "./playlist-field";
import {
  PortfolioField,
  getPortfolioFieldState,
} from "./portfolio-field";
import { toast } from "sonner";

import type { AdminPortfolio } from "@elcokiin/backend/lib/types/portfolio";

const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  label: z.string().optional(),
  image: z.string().optional(),
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

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\/.+\..+/.test(value), {
    message: "Enter a valid URL starting with http:// or https://",
  });

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be under 80 characters"),
  headline: z.string().max(160, "Headline must be under 160 characters").optional(),
  avatarUrl: optionalUrl.optional(),
  avatarStorageId: z.string().optional(),
  about: z.string().optional(),
  philosophy: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional().default([]),
  hobbies: z.array(hobbySchema).optional().default([]),
  playlist: playlistSchema.optional().default({ spotifyPlaylistId: "", songs: [] }),
});

interface ProfileFormProps {
  portfolio: AdminPortfolio | null;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Separator className="flex-1" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

export function ProfileForm({ portfolio }: ProfileFormProps) {
  const { handleError } = useErrorHandler();
  const updateProfile = useMutation(api.portfolio.mutations.updateProfile);

  const form = useForm({
    defaultValues: {
      name: portfolio?.name ?? "",
      headline: portfolio?.headline ?? "",
      avatarUrl: portfolio?.avatarUrl ?? "",
      avatarStorageId: portfolio?.avatarStorageId ?? "",
      about: portfolio?.about ?? "",
      philosophy: portfolio?.philosophy ?? "",
      socialLinks: portfolio?.socialLinks ?? [],
      hobbies: portfolio?.hobbies ?? [],
      playlist: portfolio?.playlist ?? { spotifyPlaylistId: "", songs: [] },
    },
    validators: {
      onChange: profileSchema as any,
      onSubmit: profileSchema as any,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateProfile({
          name: value.name,
          headline: value.headline || undefined,
          avatarUrl: normalizeOptionalText(value.avatarUrl ?? ""),
          avatarStorageId:
            value.avatarStorageId && value.avatarUrl?.trim()
              ? value.avatarStorageId
              : undefined,
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
      <div className="grid gap-10">
        <div className="space-y-6">
          <SectionHeader label="Basic Information" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <form.Field
              name="name"
              validators={{
                onChange: profileSchema.shape.name,
                onBlur: profileSchema.shape.name,
              }}
            >
              {(field) => {
                const { errors, invalid, showErrors } = getPortfolioFieldState(field);
                return (
                  <PortfolioField
                    label="Name"
                    htmlFor={field.name}
                    required
                    errors={errors}
                    showErrors={showErrors}
                  >
                    <InputWithIcon
                      icon={<UserIcon />}
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Your name"
                      aria-invalid={invalid || undefined}
                      required
                    />
                  </PortfolioField>
                );
              }}
            </form.Field>

            <form.Field
              name="headline"
              validators={{
                onChange: profileSchema.shape.headline.unwrap(),
                onBlur: profileSchema.shape.headline.unwrap(),
              }}
            >
              {(field) => {
                const { errors, invalid, showErrors } = getPortfolioFieldState(field);
                return (
                  <PortfolioField
                    label="Headline"
                    htmlFor={field.name}
                    optional
                    errors={errors}
                    showErrors={showErrors}
                  >
                    <InputWithIcon
                      icon={<TagIcon />}
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Full-Stack Developer"
                      aria-invalid={invalid || undefined}
                    />
                  </PortfolioField>
                );
              }}
            </form.Field>
          </div>

          <form.Field
            name="avatarUrl"
            validators={{
              onChange: profileSchema.shape.avatarUrl.unwrap(),
              onBlur: profileSchema.shape.avatarUrl.unwrap(),
            }}
          >
            {(field) => {
              const { errors, showErrors } = getPortfolioFieldState(field);
              return (
                <div className="grid gap-2.5">
                  <AvatarField
                    value={{
                      url: field.state.value,
                      storageId: field.form.getFieldValue("avatarStorageId") ?? undefined,
                    }}
                    onChange={(avatar) => {
                      field.handleChange(avatar.url);
                      field.form.setFieldValue("avatarStorageId", avatar.storageId ?? "");
                    }}
                  />
                  {showErrors && (errors ?? []).map((error) => (
                    <p key={error?.message} className="text-xs text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              );
            }}
          </form.Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <SectionHeader label="About" />

            <form.Field name="about">
              {(field) => (
                <PortfolioField
                  label="About (Markdown)"
                  htmlFor={field.name}
                  description="Supports Markdown formatting."
                >
                  <TextareaWithIcon
                    icon={<FileTextIcon />}
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Write about yourself..."
                    rows={5}
                  />
                </PortfolioField>
              )}
            </form.Field>
          </div>

          <div className="space-y-6">
            <SectionHeader label="Philosophy" />

            <form.Field name="philosophy">
              {(field) => (
                <PortfolioField
                  label="Philosophy (Markdown)"
                  htmlFor={field.name}
                  description="Your guiding principles and approach to work."
                >
                  <TextareaWithIcon
                    icon={<LightbulbIcon />}
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your philosophy..."
                    rows={5}
                  />
                </PortfolioField>
              )}
            </form.Field>
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader label="Social Links" />

          <form.Field name="socialLinks">
            {(field) => (
              <SocialLinksField
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>

        <div className="space-y-6">
          <SectionHeader label="Hobbies" />

          <form.Field name="hobbies">
            {(field) => (
              <HobbiesField
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>

        <div className="space-y-6">
          <SectionHeader label="Playlist" />

          <form.Field name="playlist">
            {(field) => (
              <PlaylistField
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>

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
