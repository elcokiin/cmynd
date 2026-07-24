import { PlusIcon, Trash2Icon } from "lucide-react";
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
      <Label>Playlist</Label>
      <Input
        placeholder="Spotify Playlist ID (optional)"
        value={value.spotifyPlaylistId ?? ""}
        onChange={(e) => updateSpotifyId(e.target.value)}
      />
      <div className="space-y-2">
        {songs.map((song, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <Input
                placeholder="Title"
                value={song.title}
                onChange={(e) => updateSong(index, "title", e.target.value)}
              />
              <Input
                placeholder="Artist"
                value={song.artist}
                onChange={(e) => updateSong(index, "artist", e.target.value)}
              />
              <Input
                placeholder="YouTube ID (optional)"
                value={song.youtubeId ?? ""}
                onChange={(e) => updateSong(index, "youtubeId", e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSong(index)}
              className="shrink-0 mt-0.5"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addSong}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Song
        </Button>
      </div>
    </div>
  );
}
