import { useEffect, useState } from "react";
import Header from "../components/Header";
import VinylRecord from "../components/VinylRecord";
import MusicControls from "../components/MusicControls";
import ProgressBar from "../components/ProgressBar";
import { useAudioPlayer } from "../contexts/AudioContext";
import { useDominantColor } from "../contexts/useDominantColor";


const Player = () => {
    const {
        currentSong, isPlaying, currentTime, duration, volume, activePlaylistCover,
        playPause, seek, changeVolume, nextSong, previousSong, toggleLoop,
        skipBack10,
        skipForward10
    } = useAudioPlayer();

    const [isThemeEnabled, setIsThemeEnabled] = useState(false);

    // Đọc cài đặt từ localStorage khi component được tải
    useEffect(() => {
        const savedThemeSetting = localStorage.getItem('cdThemeEnabled');
        setIsThemeEnabled(savedThemeSetting === 'true');
    }, []);

    const dominantColors = useDominantColor(activePlaylistCover ?? null, isThemeEnabled, 2);

    const songTitle = currentSong?.title || "Chưa có bài hát";
    const songArtist = currentSong?.artist || "Vui lòng chọn một bài";

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
        // Thêm `relative` để làm gốc cho các lớp phủ
        <div
            style={backgroundStyle}
            // Thêm transition để chuyển màu nền mượt mà
            className="relative flex flex-col text-white h-screen w-[450px] mx-auto overflow-hidden select-none transition-all duration-1000"
        >
            {/* Lớp nền mặc định, sẽ bị che đi khi có màu chủ đạo */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] -z-10"></div>

            <Header title={songTitle} artist={songArtist} />

            <VinylRecord
                title={songTitle}
                isPlaying={isPlaying}
                imageUrl={activePlaylistCover}
            />

            {/* ✅ BƯỚC 2.4: ÁP DỤNG HIỆU ỨNG "GLASSMORPHISM" CHO KHU VỰC ĐIỀU KHIỂN */}
            <div className="flex flex-col justify-end px-6 pb-8 mt-auto 
                           bg-black/10 backdrop-blur-md 
                           border-t border-white/10 rounded-t-3xl pt-6">
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