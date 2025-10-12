import { ArrowLeft, Home, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlaylistCard } from "../components/PlaylistCard";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { Playlist } from "..";

const Playlists = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    // ✅ BƯỚC 2: TẠO STATE MỚI ĐỂ LƯU DỮ LIỆU THẬT
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ BƯỚC 3: DÙNG useEffect ĐỂ GỌI API TỪ BACKEND
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const result = await invoke<Playlist[]>('load_playlists');
                setPlaylists(result);
            } catch (error) {
                console.error("Lỗi khi tải playlists:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylists();
    }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        setIsScrolled(event.currentTarget.scrollTop > 10);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] text-white w-[450px] mx-auto select-none overflow-hidden">
            {/* Header (không đổi) */}
            <div className={`sticky top-0 z-10 px-6 pt-8 pb-4 transition-all duration-300 ${isScrolled ? 'bg-black/20 backdrop-blur-lg' : 'bg-transparent'}`}>
                <div className="relative flex items-center justify-center">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-center">
                        <button onClick={() => navigate("/playlists/add")} title="Thêm Playlist" className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all duration-300 hover:scale-110"><Plus size={22} className="text-purple-300" /></button>
                        <button onClick={() => navigate("/list")} title="Quay Lại" className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all duration-300 hover:scale-110"><ArrowLeft size={22} className="text-purple-300" /></button>
                    </div>
                    <div className="text-center">
                        <h1 className="text-lg font-semibold tracking-wide">Playlists</h1>
                        <p className="text-xs text-gray-400 mt-1">{playlists.length} playlists</p>
                    </div>
                    <button onClick={() => navigate("/")} title="Phát Nhạc" className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all duration-300 hover:scale-110"><Home size={22} className="text-purple-300" /></button>
                </div>
            </div>

            <div onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none]">
                {/* ✅ BƯỚC 4: HIỂN THỊ SKELETON LOADING HOẶC DANH SÁCH THẬT */}
                {isLoading ? (
                    // Giao diện khi đang tải
                    <div className="grid grid-cols-2 gap-5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
               ) : playlists.length > 0 ? (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-5">
                        {/* ✅ ĐÃ SỬA: Thay {} bằng () để tự động return */}
                        {playlists.map((playlist) => (
                            <motion.div
                                key={playlist.id}
                                variants={itemVariants}
                                onClick={() => navigate(`/playlists/${playlist.id}`)}
                            >
                                <PlaylistCard playlist={playlist} />
                            </motion.div>
                         ))}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <p className="text-lg">Thư viện trống</p>
                        <p className="text-sm mt-2">Nhấn nút <Plus size={14} className="inline-block mx-1" /> để tạo playlist đầu tiên!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Playlists;