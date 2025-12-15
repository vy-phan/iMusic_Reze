import { Play, ArrowRight, Plus, ListMusic as PlaylistIcon, Trash2, Pause } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Song } from "..";
import AddSongModal from "../components/AddSongModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAudioPlayer } from "../contexts/AudioContext";
import { invoke } from "@tauri-apps/api/core";


const ListMusic = () => {
    const navigate = useNavigate();
    const {
        playlist: songs,
        playSong,
        refetchPlaylist,
        currentSong,
        isPlaying,
        playPause
    } = useAudioPlayer();
    const [isModalOpen, setModalOpen] = useState(false);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [songToDelete, setSongToDelete] = useState<Song | null>(null);

    const handleAddSong = () => {
        refetchPlaylist();
    };

    const handlePlaySong = (songToPlay: Song) => {
        playSong(songToPlay);
        navigate("/");
    };

    const openDeleteConfirmation = (song: Song) => {
        setSongToDelete(song);      // Lưu thông tin bài hát
        setDeleteModalOpen(true);   // Mở modal
    };

    // --- BƯỚC 2.3: HÀM XỬ LÝ XÓA, SẼ ĐƯỢC GỌI TỪ BÊN TRONG MODAL ---
    const handleConfirmDelete = async () => {
        if (!songToDelete) return; // Kiểm tra an toàn

        try {
            // Gọi command Rust
            await invoke('delete_song', { songPathToDelete: songToDelete.path });

            // Đóng modal và reset state
            setDeleteModalOpen(false);
            setSongToDelete(null);

            // Tải lại danh sách
            refetchPlaylist();

            // Thay thế alert bằng một thông báo tốt hơn trong tương lai (ví dụ: toast notification)
            alert(`Đã xóa bài hát "${songToDelete.title}" thành công!`);

        } catch (error) {
            console.error("Lỗi khi xóa bài hát:", error);
            alert(`Không thể xóa bài hát: ${error}`);
            // Đóng modal ngay cả khi có lỗi
            setDeleteModalOpen(false);
            setSongToDelete(null);
        }
    };


    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] text-white w-[450px] mx-auto select-none overflow-hidden">
            {/* Header */}
            <div className="relative flex items-center justify-center px-6 pt-8 pb-8">
                <div className="absolute left-6 flex flex-col gap-3">
                    <button onClick={() => setModalOpen(true)}
                        title="Thêm Nhạc"
                        className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                        <Plus size={22} className="text-purple-300" />
                    </button>
                    <button
                        onClick={() => navigate("/playlists")}
                        title="Playlist"
                        className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                    >
                        <PlaylistIcon size={22} className="text-purple-300" />
                    </button>
                </div>
                <div className="text-center">
                    <h1 className="text-lg font-semibold tracking-wide">Danh sách nhạc</h1>
                    <p className="text-xs text-gray-400 mt-1">{songs.length} bài hát 💜</p>
                </div>
                <button onClick={() => navigate("/")}
                    title="Quay Lại"
                    className="absolute right-6 p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    <ArrowRight size={22} className="text-purple-300" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 [scrollbar-width:none] [-ms-overflow-style:none]" style={{ scrollbarWidth: "none" }}>
                {songs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <p>Chưa có bài hát nào.</p>
                        <p className="text-sm mt-1">Nhấn nút <Plus size={14} className="inline-block mx-1" /> để thêm bài hát đầu tiên!</p>
                    </div>
                )}
                {songs.map((song, index) => {
                    // ✅ BƯỚC 2: KIỂM TRA XEM ĐÂY CÓ PHẢI BÀI HÁT ĐANG PHÁT KHÔNG
                    const isActive = currentSong?.path === song.path;

                    return (
                        <div
                            key={song.path}
                            // ✅ BƯỚC 3: THAY ĐỔI STYLE CỦA DÒNG KHI BÀI HÁT ĐANG ACTIVE
                            className={`flex items-center justify-between backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-2xl p-4 border hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] ${isActive
                                    ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' // Style khi active
                                    : 'border-white/10 hover:border-purple-400/40' // Style mặc định
                                }`}
                        >
                            <div>
                                <h3 className="text-base font-medium text-white/90">{index + 1}. {song.title}</h3>
                                <p className="text-sm text-gray-400">{song.artist}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">{song.duration}</span>
                                <button
                                    onClick={() => openDeleteConfirmation(song)}
                                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/20 transition-all duration-300 hover:scale-105"
                                    title="Xóa vĩnh viễn"
                                >
                                    <Trash2 size={16} />
                                </button>

                                {/* ✅ BƯỚC 4: THAY ĐỔI NÚT PLAY/PAUSE VÀ HÀNH ĐỘNG CỦA NÓ */}
                                <button
                                    onClick={isActive ? playPause : () => handlePlaySong(song)}
                                    className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${isActive && isPlaying
                                            ? 'bg-pink-500/80 hover:bg-pink-600 shadow-[0_0_8px_rgba(245,158,11,0.5)]'  // Màu xanh lá khi đang phát
                                            : 'bg-purple-600/80 hover:bg-purple-700 shadow-[0_0_8px_rgba(168,85,247,0.5)]' // Màu tím mặc định
                                        }`}
                                >
                                    {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <AddSongModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onAddSong={handleAddSong} />
            {songToDelete && (
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title={`Xóa vĩnh viễn "${songToDelete.title}"`}
                    message="Hành động này sẽ xóa file nhạc khỏi ổ cứng của bạn và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
                    confirmText="Xóa vĩnh viễn"
                    cancelText="Không, giữ lại"
                />
            )}
        </div>
    );
};

export default ListMusic;