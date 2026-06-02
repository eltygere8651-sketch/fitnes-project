export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: string;
  url?: string;
  description?: string;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  genre: string;
  description: string;
  icon: string;
  thumbnail_url?: string;
  tracks: MusicTrack[];
  ownerId?: string;
  createdAt?: any;
  updatedAt?: any;
  folder?: string | null;
}
