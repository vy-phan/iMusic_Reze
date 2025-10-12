export interface Song {
  index?: number; // Chỉ số của bài hát trong danh sách, không bắt buộc
  title: string;
  artist: string;
  duration: string;
  path: string; 
}

export interface PlaylistItem {
  position: number;
  song_path: string;
}

export interface Playlist {
  id: string; 
  name: string;
  cover_image_path?: string | null; 
  songs: PlaylistItem[];
}