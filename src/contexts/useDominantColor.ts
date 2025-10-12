import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';
import { rgbToHex } from '../utils/RgbToHex';

/**
 * Một custom hook để trích xuất các màu chủ đạo từ một URL ảnh.
 * @param imageUrl URL của ảnh cần xử lý.
 * @param isEnabled Cờ để bật/tắt việc lấy màu.
 * @param colorCount Số lượng màu cần lấy ra.
 * @returns Một mảng chứa các mã màu hex.
 */
export const useDominantColor = (
  imageUrl: string | null,
  isEnabled: boolean = true,
  colorCount: number = 2
) => {
  const [dominantColors, setDominantColors] = useState<string[]>([]);

  useEffect(() => {
    // Nếu bị tắt, không có ảnh, hoặc số lượng màu không hợp lệ -> reset và thoát
    if (!isEnabled || !imageUrl || colorCount < 1) {
      setDominantColors([]);
      return;
    }

    const colorThief = new ColorThief();
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Rất quan trọng để tránh lỗi CORS

    img.onload = () => {
      try {
        const palette = colorThief.getPalette(img, colorCount);
        if (palette) {
          const hexColors = palette.map(rgb => rgbToHex(rgb[0], rgb[1], rgb[2]));
          setDominantColors(hexColors);
        }
      } catch (error) {
        console.error("Lỗi khi dùng ColorThief:", error);
        setDominantColors([]);
      }
    };

    img.onerror = () => {
        console.error("Lỗi khi tải ảnh để lấy màu.");
        setDominantColors([]);
    }

    img.src = imageUrl;

  }, [imageUrl, isEnabled, colorCount]); // Chạy lại khi các giá trị này thay đổi

  return dominantColors;
};