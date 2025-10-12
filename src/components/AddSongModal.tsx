import { X, Upload } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { basename } from "@tauri-apps/api/path";
import { Song } from ".."; 

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: Song) => void;
}

export default function AddSongModal({ isOpen, onClose, onAddSong }: AddSongModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Chọn file nhạc bằng Tauri dialog
  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Audio files", extensions: ["mp3", "wav"] }],
      });

      if (typeof selected === "string") {
        const name = await basename(selected);
        setFilePath(selected);
        setFileName(name);
      }
    } catch (err) {
      console.error("❌ Lỗi chọn file:", err);
      alert("Không thể mở hộp thoại chọn file!");
    }
  };

  // Gửi dữ liệu sang backend Rust
  const handleAdd = async () => {
    if (!title || !artist || !filePath) {
      alert("⚠️ Vui lòng nhập đủ thông tin và chọn file nhạc!");
      return;
    }

    try {
      setIsLoading(true);

      const result = await invoke<{
        title: string;
        artist: string;
        duration: string;
        path: string;
      }>("save_music_file", {
        title,
        artist,
        filePath,
      });

      onAddSong({
        title: result.title,
        artist: result.artist,
        duration: result.duration,
        path: result.path,
      });

      // Reset form
      setTitle("");
      setArtist("");
      setFilePath(null);
      setFileName(null);
      onClose();
    } catch (err) {
      console.error("❌ Lỗi khi lưu bài hát:", err);
      alert("Không thể lưu bài hát!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative w-[90%] max-w-md rounded-2xl p-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, rgba(88,28,135,0.6) 0%, rgba(147,51,234,0.45) 50%, rgba(236,72,153,0.4) 100%)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 0 25px rgba(168,85,247,0.25)",
            backdropFilter: "blur(25px)",
          }}
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-200 hover:text-white transition">
            <X size={22} />
          </button>

          <h2 className="text-lg font-semibold mb-5 text-center text-purple-200">
            🎧 Thêm bài hát mới
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-purple-200 mb-1 block">Tên bài hát</label>
              <input
                type="text"
                placeholder="VD: Phía Sau Một Cô Gái"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl p-2 outline-none focus:border-pink-400 transition placeholder-gray-400 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-purple-200 mb-1 block">Ca sĩ</label>
              <input
                type="text"
                placeholder="VD: Soobin Hoàng Sơn"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl p-2 outline-none focus:border-pink-400 transition placeholder-gray-400 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-purple-200 mb-2 block">File nhạc (MP3 / WAV)</label>
              <div
                onClick={handleSelectFile}
                className="relative w-full bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition group"
              >
                <Upload className="text-pink-300 group-hover:scale-110 transition" size={28} />
                <p className="mt-2 text-sm text-gray-200">
                  {fileName ? fileName : "Chọn file nhạc từ máy"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isLoading}
            className={`mt-6 w-full ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-purple-600 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            } text-white font-medium py-2.5 rounded-xl transition-all`}
          >
            {isLoading ? "⏳ Đang lưu..." : "Thêm bài hát"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
