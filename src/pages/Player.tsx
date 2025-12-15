import { useEffect, useState, useRef } from "react";
import { Play, BarChart3 } from "lucide-react"; // Import thêm icon
import Header from "../components/Header";
import VinylRecord from "../components/VinylRecord";
import MusicControls from "../components/MusicControls";
import ProgressBar from "../components/ProgressBar";
import { useAudioPlayer } from "../contexts/AudioContext";
import { useDominantColor } from "../contexts/useDominantColor";

const Player = () => {
    // 1. Lấy thêm playlist, activePlaylist, playSong từ Context
    const {
        currentSong, isPlaying, currentTime, duration, volume, activePlaylistCover,
        playlist, activePlaylist, playSong, // <--- THÊM MỚI
        playPause, seek, changeVolume, nextSong, previousSong, toggleLoop,
        skipBack10, skipForward10
    } = useAudioPlayer();

    const [isThemeEnabled, setIsThemeEnabled] = useState(false);

    // 2. State quản lý việc hiển thị danh sách
    const [showQueue, setShowQueue] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    // Xác định danh sách nhạc hiện tại (Playlist đang chọn hoặc toàn bộ thư viện)
    const currentQueue = activePlaylist || playlist;

    useEffect(() => {
        const savedThemeSetting = localStorage.getItem('cdThemeEnabled');
        setIsThemeEnabled(savedThemeSetting === 'true');
    }, []);

    // Auto scroll tới bài đang phát khi mở list
    useEffect(() => {
        if (showQueue && currentSong && listRef.current) {
            const index = currentQueue.findIndex(s => s.path === currentSong.path);
            if (index !== -1) {
                const item = listRef.current.children[index] as HTMLElement;
                item?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [showQueue, currentSong]);

    const dominantColors = useDominantColor(activePlaylistCover ?? null, isThemeEnabled, 2);
    const songTitle = currentSong?.title || "Chưa có bài hát";
    const songArtist = currentSong?.artist || "Vui lòng chọn một bài";

    const headerAccentColor = (isThemeEnabled && dominantColors.length > 0)
        ? dominantColors[0]
        : undefined;
    const listAccentColor = (isThemeEnabled && dominantColors.length > 0)
        ? dominantColors[0]
        : '#9333ea';
    const backgroundStyle = (isThemeEnabled && dominantColors.length >= 2)
        ? {
            backgroundColor: dominantColors[1],
            backgroundImage: `
                radial-gradient(ellipse 90% 60% at 50% 40%, ${dominantColors[0]}40, transparent),
                linear-gradient(180deg, ${dominantColors[1]}90 5%, #0f0a1a 95%)
            `
        }
        : {};

    return (
        <div
            style={backgroundStyle}
            className="relative flex flex-col text-white h-screen w-[450px] mx-auto overflow-hidden select-none transition-all duration-1000"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] -z-10"></div>

            {/* HEADER: Truyền props để xử lý click */}
            <Header
                title={songTitle}
                artist={songArtist}
                onTitleClick={() => setShowQueue(!showQueue)}
                isQueueOpen={showQueue}
                accentColor={headerAccentColor}
            />

            {/* AREA GIỮA: CHỨA CẢ VINYL VÀ DANH SÁCH PHÁT (Overlay) */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">

                {/* 1. Đĩa than (Hiện mờ đi khi mở list) */}
                <div className={`transition-all duration-500 ${showQueue ? 'opacity-20 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
                    <VinylRecord
                        title={songTitle}
                        isPlaying={isPlaying}
                        imageUrl={activePlaylistCover}
                    />
                </div>

                {/* 2. Danh sách phát (Trượt từ dưới lên đè lên đĩa than) */}
                <div
                    className={`absolute inset-0 px-4 pt-2 transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) z-10 
                                ${showQueue ? 'translate-y-0' : 'translate-y-[120%]'}`}
                >
                    <div
                        className="h-full bg-[#120822]/20 backdrop-blur-2xl rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl"
                        style={{ '--list-accent-color': listAccentColor } as React.CSSProperties}
                    >
                        {/* Header nhỏ */}
                        <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-gray-200 uppercase tracking-widest">Danh sách phát</span>
                        </div>

                        {/* List items */}
                        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {currentQueue.map((song, index) => {
                                const isActive = currentSong?.path === song.path;
                                return (
                                    <div
                                        key={index}
                                        onClick={() => playSong(song, activePlaylist || undefined, activePlaylistCover)}
                                        className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border
                                            ${isActive
                                                ? 'bg-[color-mix(in_srgb,var(--list-accent-color),transparent_60%)] border-[color-mix(in_srgb,var(--list-accent-color),transparent_60%)] text-white backdrop-blur-md'
                                                : 'border-transparent text-gray-300 hover:bg-[color-mix(in_srgb,var(--list-accent-color),transparent_85%)] hover:border-[color-mix(in_srgb,var(--list-accent-color),transparent_80%)] hover:text-white'
                                            }`}
                                    >

                                        {/* Icon / Index */}
                                        <div className="w-6 flex justify-center text-xs shrink-0 relative z-10">
                                            {isActive ? (
                                                <BarChart3 size={14} className="text-white animate-pulse drop-shadow-md" />
                                            ) : (
                                                <>
                                                    <span className="group-hover:hidden font-mono opacity-60">{index + 1}</span>
                                                    <Play
                                                        size={12}
                                                        className="hidden group-hover:block text-white fill-[var(--list-accent-color)]"
                                                    />
                                                </>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 text-left flex flex-col gap-0.5 relative z-10">
                                            <p className={`text-sm font-medium truncate ${isActive ? 'text-white font-bold' : ''}`}>
                                                {song.title}
                                            </p>
                                            <p className={`text-xs truncate transition-colors
                                                ${isActive
                                                    ? 'text-white/80' // Active: Chữ trắng mờ nhẹ
                                                    : 'text-gray-400 group-hover:text-white group-hover:opacity-90'
                                                }`}>
                                                {song.artist}
                                            </p>
                                        </div>
                                        {!isActive && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-[0_0_8px_var(--list-accent-color)]" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* CONTROLS: Giữ nguyên vị trí và style cũ */}
            <div className="flex flex-col justify-end px-6 pb-8 mt-auto 
                           bg-black/10 backdrop-blur-md z-20 
                           border-t border-white/10 rounded-t-3xl pt-6 shadow-lg">
                <ProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={seek}
                    accentColor={dominantColors[0]}
                />
                <div className="mt-6">
                    <MusicControls
                        isPlaying={isPlaying}
                        onPlayPause={playPause}
                        onPrevious={previousSong}
                        onNext={nextSong}
                        onRepeat={toggleLoop}
                        onSkipBack10={skipBack10}
                        onSkipForward10={skipForward10}
                        volume={volume}
                        onVolumeChange={changeVolume}
                        accentColor={dominantColors[0]}
                    />
                </div>
            </div>
        </div>
    );
}

export default Player;