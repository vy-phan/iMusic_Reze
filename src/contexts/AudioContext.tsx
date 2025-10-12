import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Song } from '..';
import { invoke } from '@tauri-apps/api/core';
import { convertFileSrc } from '@tauri-apps/api/core';
import { mediaControls, PlaybackStatus, RepeatMode } from 'tauri-plugin-media-api';

interface AudioContextType {
  playlist: Song[];
  currentSong?: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLooping: boolean;
  activePlaylistCover?: string | null;
  playSong: (song: Song, contextPlaylist?: Song[], playlistCover?: string | null) => void;
  playPause: () => void;
  seek: (time: number) => void;
  changeVolume: (volume: number) => void;
  nextSong: () => void;
  previousSong: () => void;
  toggleLoop: () => void;
  skipBack10: () => void;
  skipForward10: () => void;
  refetchPlaylist: () => void; // ✅ ĐÂY LÀ DÒNG BỊ THIẾU
}


const AudioContext = createContext<AudioContextType | null>(null);

export const useAudioPlayer = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [fullLibrary, setFullLibrary] = useState<Song[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Song[] | null>(null);
  const [activePlaylistCover, setActivePlaylistCover] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | undefined>(() => {
    const savedSong = localStorage.getItem('player_currentSong');
    return savedSong ? JSON.parse(savedSong) : undefined;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSrc, setAudioSrc] = useState<string | undefined>();
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('player_volume');
    return savedVolume ? parseInt(savedVolume, 10) : 40;
  });
  const [isLooping, setIsLooping] = useState(() => {
    const savedLoop = localStorage.getItem('player_isLooping');
    return savedLoop === 'true';
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaInitialized = useRef(false);

  // Khởi tạo và dọn dẹp plugin media
  useEffect(() => {
    mediaControls.initialize('com.dell.i-music', 'iMusic').catch(console.error);
    // Dọn dẹp khi component bị unmount
    return () => {
      mediaControls.clearNowPlaying().catch(console.error);
    }
  }, []);

  const fetchLibrary = useCallback(async () => {
    try {
      const loadedSongs = await invoke<Song[]>('load_music_library');
      setFullLibrary(loadedSongs);
      if (!currentSong && loadedSongs.length > 0) {
        const savedSongPath = (JSON.parse(localStorage.getItem('player_currentSong') || 'null') as Song | null)?.path;
        const songExistsInNewPlaylist = savedSongPath && loadedSongs.some(s => s.path === savedSongPath);
        if (!songExistsInNewPlaylist) {
          setCurrentSong(loadedSongs[0]);
        }
      }
    } catch (error) { console.error("Không thể tải thư viện nhạc:", error); }
  }, [currentSong]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  useEffect(() => {
    if (currentSong?.path) {
      setAudioSrc(convertFileSrc(currentSong.path));
      localStorage.setItem('player_currentSong', JSON.stringify(currentSong));
    }
  }, [currentSong]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Lỗi khi phát nhạc:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.loop = isLooping;
    }
    localStorage.setItem('player_volume', volume.toString());
    localStorage.setItem('player_isLooping', isLooping.toString());
  }, [volume, isLooping]);


  // ✅ BƯỚC 1: TÁCH RA: useEffect này chỉ cập nhật metadata & trạng thái play/pause
  // Nó chỉ chạy khi bài hát thay đổi hoặc khi play/pause
  useEffect(() => {
    const updateMetadataAndStatus = async () => {
      if (currentSong?.path) {
        try {
          if (!mediaInitialized.current) {
            await mediaControls.initialize('com.dell.i-music', 'iMusic');
            mediaInitialized.current = true;
          }

          await mediaControls.updateNowPlaying(
            { // Metadata
              title: currentSong.title,
              artist: currentSong.artist,
              duration: Math.round(duration),
              artworkUrl: '',
              artworkData: ''
            },
            { // Playback Info
              status: isPlaying ? PlaybackStatus.Playing : PlaybackStatus.Paused,
              repeatMode: isLooping ? RepeatMode.Track : RepeatMode.None,
            }
          );
        } catch (error) {
          console.error("Lỗi khi cập nhật metadata:", error);
        }
      }
    };
    updateMetadataAndStatus();
  }, [currentSong, isPlaying, duration, isLooping]); // Không còn phụ thuộc vào currentTime

  // ✅ BƯỚC 2: TẠO useEffect MỚI: Chỉ cập nhật vị trí (position)
  // Nó chạy liên tục khi nhạc đang phát
  useEffect(() => {
    const updatePosition = async () => {
      if (isPlaying && currentSong?.path) {
        try {
          await mediaControls.updatePosition(Math.round(currentTime));
        } catch (error) {
          // Bỏ qua lỗi ở đây để không spam console
        }
      }
    };
    // Cập nhật sau mỗi giây để tránh quá tải
    const interval = setInterval(updatePosition, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, currentSong]);


  const playSong = (song: Song, contextPlaylist?: Song[], playlistCover?: string | null) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (contextPlaylist) {
      setActivePlaylist(contextPlaylist);
      setActivePlaylistCover(playlistCover || null); // Lưu ảnh bìa của playlist
    } else {
      setActivePlaylist(null);
      setActivePlaylistCover(null); // Reset ảnh bìa khi về chế độ thư viện
    }
  };


  const playPause = () => setIsPlaying(!isPlaying);

  const seek = (newTime: number) => {
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  const changeVolume = (newVolume: number) => setVolume(newVolume);

  const findCurrentIndex = () => {
    // Ưu tiên tìm trong activePlaylist, nếu không có thì tìm trong thư viện đầy đủ
    const listToSearch = activePlaylist || fullLibrary;
    return currentSong ? listToSearch.findIndex(song => song.path === currentSong.path) : -1;
  };

  const nextSong = () => {
    const listToPlay = activePlaylist || fullLibrary;
    if (listToPlay.length === 0) return;
    const currentIndex = findCurrentIndex();
    const nextIndex = (currentIndex + 1) % listToPlay.length;
     playSong(listToPlay[nextIndex], activePlaylist || undefined, activePlaylistCover); 
  };

  const previousSong = () => {
    const listToPlay = activePlaylist || fullLibrary;
    if (listToPlay.length === 0) return;
    const currentIndex = findCurrentIndex();
    const prevIndex = (currentIndex - 1 + listToPlay.length) % listToPlay.length;
    playSong(listToPlay[prevIndex], activePlaylist || undefined, activePlaylistCover); 
  };

  const toggleLoop = () => setIsLooping(!isLooping);

  const skipBack10 = () => {
    if (audioRef.current) audioRef.current.currentTime -= 10;
  };

  const skipForward10 = () => {
    if (audioRef.current) audioRef.current.currentTime += 10;
  };

  const onTimeUpdate = () => audioRef.current && setCurrentTime(audioRef.current.currentTime);
  const onLoadedMetadata = () => audioRef.current && setDuration(audioRef.current.duration);

  const value: AudioContextType = {
    playlist: fullLibrary, activePlaylistCover, currentSong, isPlaying, currentTime, duration, volume, isLooping,
    playSong, playPause, seek, changeVolume, nextSong, previousSong, toggleLoop,
    skipBack10,
    skipForward10,
    refetchPlaylist: fetchLibrary
  };

  return (
    <AudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={nextSong}
      />
      {children}
    </AudioContext.Provider>
  );
};