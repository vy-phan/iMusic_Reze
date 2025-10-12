import { ArrowLeft, Check, Music2, Search, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../contexts/AudioContext";
import { useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog"; // Import Tauri Dialog
import { convertFileSrc } from "@tauri-apps/api/core"; // Import để xem trước ảnh

const PlaylistAdd = () => {
    const navigate = useNavigate();
    const { playlist: allSongs } = useAudioPlayer();

    // State cho playlist mới
    const [playlistName, setPlaylistName] = useState("");
    const [playlistImagePath, setPlaylistImagePath] = useState<string | null>(null);
    const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());

    // State cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    // Hàm chọn ảnh bìa
    const handleSelectImage = async () => {
        try {
            const selected = await open({
                multiple: false,
                filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
            });
            if (typeof selected === 'string') {
                setPlaylistImagePath(selected);
            }
        } catch (error) {
            console.error("Lỗi khi chọn ảnh:", error);
            alert("Không thể mở hộp thoại chọn ảnh.");
        }
    };

    // Lọc danh sách bài hát dựa trên searchTerm
    const filteredSongs = useMemo(() => {
        if (!searchTerm) return allSongs;
        return allSongs.filter(song =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allSongs, searchTerm]);

    const toggleSongSelection = (songPath: string) => {
        setSelectedSongs(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(songPath)) newSelection.delete(songPath);
            else newSelection.add(songPath);
            return newSelection;
        });
    };

    const handleCreatePlaylist = async () => {
        if (!playlistName.trim() || selectedSongs.size === 0) {
            alert("Vui lòng nhập tên playlist và chọn ít nhất một bài hát.");
            return;
        }

        try {
            await invoke("create_playlist", {
                name: playlistName,
                coverImage: playlistImagePath, // Backend sẽ xử lý nếu giá trị này là null
                songPaths: Array.from(selectedSongs),
            });

            alert(`Playlist "${playlistName}" đã được tạo thành công!`);
            navigate("/playlists");

        } catch (error) {
            console.error("Lỗi khi tạo playlist:", error);
            alert(`Không thể tạo playlist: ${error}`);
        }
    };

    const isButtonEnabled = playlistName.trim() !== "" && selectedSongs.size > 0;

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] text-white w-[450px] mx-auto select-none overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 pt-8 pb-4 bg-[#1a0d2e]/80 backdrop-blur-lg">
                <div className="relative flex items-center justify-center">
                    <button onClick={() => navigate("/playlists")} title="Hủy" className="absolute left-0 p-2 rounded-full hover:bg-white/15 transition-colors"><ArrowLeft size={22} className="text-purple-300" /></button>
                    <h1 className="text-lg font-semibold tracking-wide">Tạo Playlist Mới</h1>
                </div>
            </div>

            {/* Phần thân trang, cho phép cuộn */}
            <div className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none]">
                {/* Khu vực thông tin Playlist */}
                <div className="flex gap-4 mb-6">
                    {/* Input Ảnh Bìa */}
                    <div
                        onClick={handleSelectImage}
                        className="w-24 h-24 shrink-0 rounded-lg bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden"
                    >
                        {playlistImagePath ? (
                            <img src={convertFileSrc(playlistImagePath)} alt="Playlist cover" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <ImageIcon size={24} className="text-gray-400 mb-1" />
                                <span className="text-xs text-center text-gray-400">Chọn ảnh</span>
                            </>
                        )}
                    </div>
                    {/* Input Tên Playlist */}
                    <div className="flex-1">
                        <label className="text-sm text-purple-200 mb-2 block">Tên Playlist</label>
                        <input
                            type="text"
                            placeholder="VD: T-Pop Gây Nghiện"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-xl p-3 outline-none focus:border-pink-400 transition placeholder-gray-400 text-white text-base"
                        />
                    </div>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài hát..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 outline-none focus:border-purple-400 transition"
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Danh sách bài hát */}
                <div className="pb-24 space-y-2">
                    {filteredSongs.map((song) => {
                        const isSelected = !!song.path && selectedSongs.has(song.path);
                        return (
                            <div
                                key={song.path || `song-${Math.random()}`}
                                onClick={() => song.path && toggleSongSelection(song.path)}
                                className={`flex items-center justify-between rounded-lg p-2 border transition-all duration-200 cursor-pointer 
                                            ${isSelected
                                        ? 'bg-purple-500/30 border-purple-400/50'
                                        : 'bg-white/5 hover:bg-white/10 border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-200 shrink-0 ${isSelected ? 'bg-purple-500' : 'bg-white/10'}`}>
                                        {isSelected ? <Check size={18} /> : <Music2 size={16} className="text-gray-400" />}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white/90 truncate max-w-[200px]">{song.title}</h3>
                                        <p className="text-xs text-gray-400">{song.artist}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 mr-2">{song.duration}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Nút "Tạo Playlist" */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-[#0f0a1a] via-[#0f0a1a]/90 to-transparent">
                <button
                    onClick={handleCreatePlaylist}
                    disabled={!isButtonEnabled}
                    className={`w-full font-bold py-3 rounded-full shadow-lg transition-all duration-300
                                ${isButtonEnabled
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    Tạo Playlist ({selectedSongs.size} bài)
                </button>
            </div>
        </div>
    );
};

export default PlaylistAdd;