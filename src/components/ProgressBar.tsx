import { useRef, useState, MouseEvent } from "react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  accentColor?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
}

export default function ProgressBar({ currentTime, duration, onSeek, accentColor }: ProgressBarProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    // Tính toán vị trí click (từ 0 đến 1) so với chiều rộng của thanh progress
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleSeek(e);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isSeeking) {
      handleSeek(e);
    }
  };

  const handleMouseUp = () => {
    setIsSeeking(false);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const progressStyle = {
    width: `${progressPercentage}%`,
    ...(accentColor ? { backgroundColor: accentColor } : {})
  };

  // Style cho chấm tròn điều khiển (thumb)
  const thumbStyle = {
    left: `${progressPercentage}%`,
    transform: 'translate(-50%, -50%)',
    // Thêm hiệu ứng "glow" với màu chủ đạo để đồng bộ với nút Play và volume
    boxShadow: accentColor ? `0 0 10px ${accentColor}` : undefined
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div
        ref={progressBarRef}
        className="relative cursor-pointer group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Ngừng seek khi chuột rời khỏi thanh
      >
        <div className="w-full h-1.5 bg-gray-700 rounded-full group-hover:h-2 transition-all duration-200">
          <div
            className={`h-full rounded-full ${!accentColor ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''
              }`}
            style={progressStyle}
          />
        </div>
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={thumbStyle}
        />
      </div>
    </div>
  );
}