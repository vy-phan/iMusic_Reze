import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCw, Volume2, Volume1, VolumeX } from "lucide-react";

interface MusicControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRepeat: () => void;
  onSkipBack10: () => void;
  onSkipForward10: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  accentColor?: string;
}

export default function MusicControls({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onRepeat,
  onSkipBack10,
  onSkipForward10,
  volume,
  onVolumeChange,
  accentColor
}: MusicControlsProps) {
  const [isRepeating, setIsRepeating] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  useEffect(() => {
    // Hàm xử lý khi một phím được nhấn
    const handleKeyDown = (event: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang gõ trong một ô input, textarea, ...
      if ((event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          onSkipBack10();
          break;
        case 'ArrowRight':
          onSkipForward10();
          break;
        case ' ': // Phím cách (Spacebar)
          event.preventDefault(); // Ngăn trình duyệt cuộn trang hoặc thực hiện hành động mặc định
          onPlayPause();
          break;
        case 'ArrowUp':
          event.preventDefault(); // Ngăn trình duyệt cuộn trang
          // Tăng âm lượng lên 5, nhưng không vượt quá 100
          onVolumeChange(Math.min(100, volume + 5));
          break;
        case 'ArrowDown':
          event.preventDefault(); // Ngăn trình duyệt cuộn trang
          // Giảm âm lượng đi 5, nhưng không thấp hơn 0
          onVolumeChange(Math.max(0, volume - 5));
          break;
        case 'z':
          handleRepeat(); // Gọi hàm nội bộ để cập nhật cả UI nút bấm
          break;
        case 'a':
          onPrevious();
          break;
        case 'd':
          onNext();
          break;
        case 'm':
          // Tái sử dụng logic của nút Mute
          const newVolume = volume > 0 ? 0 : 40; // Nếu đang có tiếng -> tắt; nếu đang tắt -> bật lại ở mức 40%
          onVolumeChange(newVolume);
          break;
        default:
          break;
      }
    };

    // Đăng ký trình lắng nghe sự kiện khi component được mount
    window.addEventListener('keydown', handleKeyDown);

    // Hủy đăng ký trình lắng nghe sự kiện khi component bị unmount (quan trọng!)
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    volume,
    onVolumeChange,
    onPlayPause,
    onSkipBack10,
    onSkipForward10,
    onPrevious,
    onNext,
    onRepeat
  ]);

  const handleRepeat = () => {
    setIsRepeating(!isRepeating);
    onRepeat();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value));
  };

  const handleMuteToggle = () => {
    const newVolume = volume > 0 ? 0 : 40;
    onVolumeChange(newVolume);
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX size={24} className="text-gray-500" />;
    if (volume < 50) return <Volume1 size={24} />;
    return <Volume2 size={24} />;
  };

  const playPauseStyle = accentColor ? {
    backgroundColor: accentColor,
    boxShadow: `0 0 20px -5px ${accentColor}`
  } : {};

  // Style cho nút Repeat khi active
  const repeatStyle = (isRepeating && accentColor) ? {
    color: accentColor,
    // Thêm `20` vào cuối mã hex để tạo độ trong suốt ~12%
    backgroundColor: `${accentColor}20`
  } : {};

  return (
    <div
      className="flex items-center justify-center space-x-5 select-none"
      style={{ '--accent-color': accentColor || '#a855f7' } as React.CSSProperties}
    >
      {/* Các nút khác giữ nguyên */}
      <button onClick={handleRepeat} className={`transition-all duration-300 p-2 rounded-full ${!accentColor && isRepeating ? "text-purple-400 bg-purple-900/40" : "text-gray-400 hover:text-white"}`} style={repeatStyle} title="Lặp Lại" >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
          <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        </svg>
      </button>
      <button onClick={onPrevious} className="text-gray-400 hover:text-white p-2 transition-colors"><SkipBack size={26} /></button>
      <button onClick={onSkipBack10} className="text-gray-400 hover:text-white transition p-1" title="Tua lại 10s"><div className="flex items-center"><RotateCw size={22} className="rotate-180" /><span className="text-xs ml-1">10</span></div></button>
      <button
        onClick={onPlayPause}
        style={playPauseStyle}
        // ✅ ĐÂY LÀ DÒNG ĐÃ SỬA
        className={`rounded-full p-4 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 ${!accentColor ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''
          }`}
      >
        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
      </button>
      <button onClick={onSkipForward10} className="text-gray-400 hover:text-white transition p-1" title="Tua tới 10s"><div className="flex items-center"><RotateCw size={22} /><span className="text-xs ml-1">10</span></div></button>
      <button onClick={onNext} className="text-gray-400 hover:text-white p-2 transition-colors"><SkipForward size={26} /></button>

      {/* Volume Control */}
      <div className="relative flex items-center" onMouseEnter={() => setShowVolumeControl(true)} onMouseLeave={() => setShowVolumeControl(false)}>
        <button onClick={handleMuteToggle} className="text-gray-400 hover:text-white transition-colors">
          <VolumeIcon />
        </button>

        {showVolumeControl && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2  z-50 transition-all duration-300 animate-fadeIn" onMouseEnter={() => setShowVolumeControl(true)} onMouseLeave={() => setShowVolumeControl(false)}>
            <div className="pt-6 pb-4 rounded-full shadow-xl border border-white/10 bg-black/20 backdrop-blur-xl flex flex-col items-center">
              <div className="h-24 flex items-center justify-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleSliderChange}
                  className="volume-range"
                  style={{ '--volume-percent': `${volume}%` } as React.CSSProperties}
                />
              </div>
              <span className="text-xs text-white/80 font-medium select-none">
                {volume}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}