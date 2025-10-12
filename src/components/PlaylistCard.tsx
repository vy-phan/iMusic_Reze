import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Playlist } from '..'; // Import interface Playlist đã được đồng bộ
import { convertFileSrc } from '@tauri-apps/api/core';
import { invoke } from '@tauri-apps/api/core';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Xử lý việc tạo URL cho ảnh từ đường dẫn tương đối của backend
  useEffect(() => {
    // Reset state khi playlist thay đổi
    setImageError(false);
    setImageUrl(null);

    const getFullImagePath = async () => {
        // Chỉ xử lý nếu có cover_image_path
        if (playlist.cover_image_path) {
            try {
                // Lấy đường dẫn thư mục nhạc từ backend
                const musicFolder = await invoke<string | null>('get_music_folder');
                
                if (musicFolder) {
                    // Kết hợp đường dẫn thư mục với tên file ảnh để có đường dẫn tuyệt đối
                    // Sử dụng / để tương thích chéo, Windows sẽ tự hiểu
                    const fullPath = `${musicFolder}/${playlist.cover_image_path}`;
                    setImageUrl(convertFileSrc(fullPath));
                } else {
                    setImageError(true); // Không có thư mục nhạc, không thể hiển thị ảnh
                }
            } catch (error) {
                console.error("Lỗi khi lấy đường dẫn ảnh:", error);
                setImageError(true);
            }
        }
    };

    getFullImagePath();
  }, [playlist.cover_image_path]);

  const handleImageError = () => {
    setImageError(true);
  };

  // Hiển thị ảnh nếu có imageUrl và không bị lỗi
  const showImage = imageUrl && !imageError;

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl 
                   transition-all duration-300 group-hover:scale-105">
        
        {/* Nền: Hiển thị ảnh hoặc gradient */}
        {showImage ? (
          <img
            src={imageUrl} // Dùng state imageUrl đã được xử lý
            alt={playlist.name}
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-800 to-pink-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
        )}
        
        {/* Hiệu ứng border và lớp phủ (không đổi) */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-purple-500/80 group-hover:shadow-2xl group-hover:shadow-purple-500/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-all duration-300 group-hover:from-black/80 group-hover:via-black/50"></div>

        {/* Tên Playlist (không đổi) */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="truncate text-lg font-bold text-white drop-shadow-md">
            {playlist.name}
          </p>
        </div>

        {/* Nút Play (không đổi) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button className="scale-90 rounded-full bg-purple-600/80 p-4 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
            <Play size={28} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};