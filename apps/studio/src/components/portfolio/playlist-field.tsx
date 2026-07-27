import { PlusIcon, Trash2Icon, MusicIcon, VideoIcon } from "lucide-react";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import type { Playlist, Song } from "@elcokiin/backend/lib/types/portfolio";

interface PlaylistFieldProps {
  value: Playlist;
  onChange: (playlist: Playlist) => void;
}

export function PlaylistField({ value, onChange }: PlaylistFieldProps) {
  const songs = value.songs ?? [];

  const updateSpotifyId = (spotifyPlaylistId: string) => {
    onChange({ ...value, spotifyPlaylistId: spotifyPlaylistId || undefined });
  };

  const addSong = () => {
    onChange({ ...value, songs: [...songs, { title: "", artist: "", youtubeId: "" }] });
  };

  const removeSong = (index: number) => {
    const updated = songs.filter((_, i) => i !== index);
    onChange({ ...value, songs: updated.length > 0 ? updated : undefined });
  };

  const updateSong = (index: number, field: keyof Song, val: string) => {
    const updated = songs.map((song, i) =>
      i === index ? { ...song, [field]: val || undefined } : song,
    );
    onChange({ ...value, songs: updated });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
          <MusicIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <Label className="text-xs mb-1.5 block font-medium">Spotify Playlist ID</Label>
          <Input
            placeholder="e.g. 37i9dQZF1DXcBWIGoYBM5M"
            value={value.spotifyPlaylistId ?? ""}
            onChange={(e) => updateSpotifyId(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        {songs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No songs added yet. Click below to add one.</p>
        ) : (
          songs.map((song, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted mt-0.5">
                <MusicIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Title"
                    value={song.title}
                    onChange={(e) => updateSong(index, "title", e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder="Artist"
                    value={song.artist}
                    onChange={(e) => updateSong(index, "artist", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="relative">
                  <VideoIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="YouTube ID (optional)"
                    value={song.youtubeId ?? ""}
                    onChange={(e) => updateSong(index, "youtubeId", e.target.value)}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSong(index)}
                className="shrink-0 size-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        <Button type="button" variant="outline" size="sm" onClick={addSong}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Song
        </Button>
      </div>
    </div>
  );
}
