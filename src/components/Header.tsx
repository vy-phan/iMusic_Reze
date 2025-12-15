import { Menu, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CSSProperties } from "react";

interface HeaderProps {
  title: string;
  artist: string;
  onTitleClick: () => void;
  isQueueOpen: boolean;
  accentColor?: string;
}

export default function Header({ title, artist, onTitleClick, isQueueOpen, accentColor }: HeaderProps) {
  const navigate = useNavigate();

  const activeColor = accentColor || "#a855f7";
  const isLongTitle = title.length > 25;
  
  return (
    <div 
        className="flex items-center justify-between px-6 pt-4 pb-4 z-30 relative w-full"
        style={{ '--header-hover-color': activeColor } as CSSProperties} 
    >
      {/* Nút Menu (Giữ nguyên kích thước, không được co lại) */}
      <button
        onClick={() => navigate("/list")}
        className="shrink-0 text-white hover:text-gray-100 transition-colors p-2 rounded-full hover:bg-white/10">
        <Menu size={24} />
      </button>

      {/* KHU VỰC TIÊU ĐỀ (Đã tối ưu) */}
      <div 
        onClick={onTitleClick}
        className="flex-1 flex flex-col items-center justify-center cursor-pointer group select-none mx-2 overflow-hidden"
      >
        <div className="flex items-center justify-center gap-1 w-full max-w-[250px]">
          <h1 
            className={`font-bold transition-colors duration-300 text-white group-hover:text-[var(--header-hover-color)] text-center line-clamp-2 break-words
              ${isLongTitle ? 'text-[15px] leading-tight' : 'text-lg leading-normal'}
            `}
          >
            {title}
          </h1>
        </div>
        
        {/* Nghệ sĩ: Cũng giới hạn 1 dòng cho gọn */}
        <p className="text-xs text-gray-200 group-hover:text-white transition-colors mt-1 truncate max-w-[200px]">
          {isQueueOpen ? "Đóng danh sách" : artist}
        </p>
      </div>

      {/* Nút Settings (Giữ nguyên kích thước) */}
      <button
        onClick={() => navigate("/settings")}
        className="shrink-0 text-white hover:text-gray-100 transition-colors p-2 rounded-full hover:bg-white/10">
        <Settings size={24} />
      </button>
    </div>
  );
}