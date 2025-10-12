import { ArrowLeft, Disc3, Folder, FolderPlus, Keyboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

const Setting = () => {
  const navigate = useNavigate();
  const [musicFolderPath, setMusicFolderPath] = useState<string | null>(null);
  // ✅ BƯỚC 1: THÊM STATE CHO DUNG LƯỢNG VÀ TRẠNG THÁI LOADING
  const [folderSize, setFolderSize] = useState<string | null>(null);
  const [isLoadingSize, setIsLoadingSize] = useState(false);
  const [isCdThemeEnabled, setIsCdThemeEnabled] = useState<boolean>(false);

 useEffect(() => {
    // Tải cài đặt thư mục nhạc
    fetchMusicFolder(); 

    // Tải cài đặt chủ đề CD từ localStorage
    const savedThemeSetting = localStorage.getItem('cdThemeEnabled');
    // Nếu giá trị lưu là "true", set state thành true, ngược lại là false
    setIsCdThemeEnabled(savedThemeSetting === 'true');
  }, []);

  // Hàm lấy đường dẫn và kích hoạt việc lấy dung lượng
  const fetchMusicFolder = async () => {
    try {
      const path = await invoke<string | null>("get_music_folder");
      setMusicFolderPath(path);
      if (path) {
        fetchFolderSize(); // Nếu có đường dẫn, bắt đầu lấy dung lượng
      }
    } catch (err) {
      console.error("Không lấy được đường dẫn lưu nhạc:", err);
    }
  };

  // ✅ BƯỚC 2: TẠO HÀM MỚI ĐỂ GỌI COMMAND TÍNH DUNG LƯỢNG
  const fetchFolderSize = async () => {
    setIsLoadingSize(true);
    try {
      const size = await invoke<string>("get_music_folder_size");
      setFolderSize(size);
    } catch (err) {
      console.error("Lỗi khi lấy dung lượng thư mục:", err);
      setFolderSize("Lỗi");
    } finally {
      setIsLoadingSize(false);
    }
  };

  // Hàm chọn thư mục và tải lại thông tin
  const handleSelectFolder = async () => {
    try {
      await invoke("select_music_folder");
      setTimeout(() => {
        fetchMusicFolder(); // Tải lại cả đường dẫn và dung lượng
      }, 500);
    } catch (err) {
      console.error("Lỗi chọn thư mục:", err);
    }
  };
  

  const handleToggleCdTheme = () => {
    const newSetting = !isCdThemeEnabled;
    setIsCdThemeEnabled(newSetting);
    localStorage.setItem('cdThemeEnabled', String(newSetting)); // Lưu dưới dạng chuỗi 'true'/'false'
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] text-white w-[450px] mx-auto select-none overflow-hidden">
      {/* Header (không đổi) */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]"
        >
          <ArrowLeft size={22} className="text-purple-300" />
        </button>
        <div className="text-center flex-1 -ml-6">
          <h1 className="text-lg font-semibold tracking-wide">Cài đặt ứng dụng</h1>
          <p className="text-xs text-gray-400 mt-1">Tùy chỉnh & cá nhân hóa trải nghiệm</p>
        </div>
        <div className="w-6" />
      </div>

      <div className="flex flex-col flex-1 px-6 mt-4 space-y-6 overflow-y-auto pb-6 [scrollbar-width:none]">
        <div className="text-center text-gray-400 text-sm leading-relaxed">
          Chọn thư mục để lưu trữ toàn bộ thư viện nhạc của bạn 🎵
        </div>

        {/* ✅ BƯỚC 3: CẬP NHẬT GIAO DIỆN CARD ĐỂ HIỂN THỊ DUNG LƯỢNG */}
        <div
          className={`rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-md border transition-all duration-300 ${
            musicFolderPath
              ? "bg-white/10 border-white/10 hover:bg-white/15 hover:border-purple-400/40"
              : "bg-white/5 border-dashed border-white/10 hover:bg-white/10"
          }`}
        >
          {/* Phần thông tin và nút */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                {musicFolderPath ? <Folder size={22} /> : <FolderPlus size={22} />}
              </div>
              <div className="flex flex-col">
                {musicFolderPath ? (
                  <>
                    <span className="text-sm font-medium text-white/90">Thư mục lưu nhạc</span>
                    <span className="text-xs text-gray-400 truncate w-56">{musicFolderPath}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 italic">Chưa chọn thư mục</span>
                )}
              </div>
            </div>
            <button
              onClick={handleSelectFolder}
              className="px-3 py-1 text-sm font-medium bg-purple-600/80 hover:bg-purple-700 rounded-lg transition-all duration-300 shadow-[0_0_6px_rgba(168,85,247,0.5)] shrink-0"
            >
              {musicFolderPath ? "Thay đổi" : "Chọn"}
            </button>
          </div>
          
          {/* Phần hiển thị dung lượng (chỉ hiện khi có đường dẫn) */}
          {musicFolderPath && (
            <>
              <div className="w-full h-px bg-white/10"></div> {/* Dòng kẻ phân cách */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Dung lượng hiện tại:</span>
                {isLoadingSize ? (
                  <div className="h-5 w-24 bg-gray-600 rounded-md animate-pulse"></div>
                ) : (
                  <span className="font-semibold text-white">{folderSize || "N/A"}</span>
                )}
              </div>
            </>
          )}
        </div>


        <div className="rounded-2xl p-4 flex items-center justify-between bg-white/10 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Disc3 size={22} />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-medium text-white/90">Giao diện trang phát nhạc</span>
                 <span className="text-xs text-gray-400">Bật hiệu xuất hiện màu chủ đạo cho trang phát nhạc</span>
              </div>
            </div>

            {/* Công tắc (Toggle Switch) */}
            <button
                onClick={handleToggleCdTheme}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none shadow-inner ${
                    isCdThemeEnabled ? 'bg-purple-600' : 'bg-gray-600'
                }`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                        isCdThemeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>

        <div className="rounded-2xl p-4 flex flex-col gap-3 bg-white/10 border border-white/10">
            {/* Tiêu đề Card */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Keyboard size={22} />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-medium text-white/90">Phím tắt</span>
                 <span className="text-xs text-gray-400">Điều khiển nhanh ứng dụng</span>
              </div>
            </div>

            {/* Dòng kẻ phân cách */}
            <div className="w-full h-px bg-white/15 my-1"></div>

            {/* Danh sách các phím tắt */}
            <div className="flex flex-col space-y-2 text-sm px-1">
                {/* Mỗi dòng là một phím tắt */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Phát / Tạm dừng</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Space</kbd>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-300">Tua tới / Tua lui 10s</span>
                    <div className="flex gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">←</kbd>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">→</kbd>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-300">Tăng / Giảm âm lượng</span>
                     <div className="flex gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">↑</kbd>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">↓</kbd>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-300">Bài trước / Bài kế tiếp</span>
                    <div className="flex gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">A</kbd>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">D</kbd>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-300">Lặp lại</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Z</kbd>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-300">Tắt tiếng</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">M</kbd>
                </div>
            </div>
        </div>

        <div className="flex-1" />
      </div>
    </div>
  );
};

export default Setting;