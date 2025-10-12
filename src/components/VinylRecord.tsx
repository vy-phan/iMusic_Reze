interface VinylRecordProps {
  title: string;
  isPlaying?: boolean;
  imageUrl?: string | null;
}

const defaultImageUrl = "./anhMacDinh.webp";

export default function VinylRecord({ title, isPlaying = false, imageUrl }: VinylRecordProps) {
  return (
    <div className="flex justify-center mb-8">
      {/* ✅ ĐÃ SỬA: Dùng padding để tạo viền thay vì div lồng nhau */}
      <div 
        className="w-72 h-72 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-700 
                   shadow-2xl flex items-center justify-center " // Thêm padding p-2
      >
        {/* ✅ ĐÃ SỬA: Bỏ bớt một div không cần thiết */}
        <div
          className={`w-full h-full rounded-full overflow-hidden transition-transform duration-300 ${isPlaying ? 'animate-spin' : ''}`}
          style={{ animationDuration: '12s' }}
        >
          <img 
            src={imageUrl || defaultImageUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </div>
  );
}