import { ArrowLeft, Check, Edit, Home, Music2, Pause, Play, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAudioPlayer } from "../contexts/AudioContext";
import { useState, useEffect, useMemo } from "react";
import { Song, Playlist } from "..";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { AnimatePresence, motion } from "framer-motion";
import { ConfirmModal } from "../components/ConfirmModal";
import { DraggableSongItem } from "../components/DraggableSongItem";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";


const PlaylistDetail = () => {
    const navigate = useNavigate();
    const { id: playlistId } = useParams<{ id: string }>();
    const { playlist: allSongs, playSong, currentSong, isPlaying, playPause } = useAudioPlayer();

    // States cho chi tiết playlist
    const [playlistDetails, setPlaylistDetails] = useState<Playlist | null>(null);
    const [songsInPlaylist, setSongsInPlaylist] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // States cho các chế độ (Editing, Adding)
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingSongs, setIsAddingSongs] = useState(false); // <-- STATE MỚI: Mở giao diện thêm bài hát
    const [originalSongsOrder, setOriginalSongsOrder] = useState<Song[]>([]);

    // States cho việc thêm bài hát (copy từ PlaylistAdd)
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSongsToAdd, setSelectedSongsToAdd] = useState<Set<string>>(new Set());

    // ✅ ĐÃ CUNG CẤP CODE ĐẦY ĐỦ: useEffect tải dữ liệu
    useEffect(() => {
        if (!playlistId) return;

        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const result = await invoke<Playlist>('get_playlist_details', { id: playlistId });
                setPlaylistDetails(result);

                if (result.cover_image_path) {
                    const musicFolder = await invoke<string | null>('get_music_folder');
                    if (musicFolder) {
                        const fullPath = `${musicFolder}/${result.cover_image_path}`;
                        setCoverImageUrl(convertFileSrc(fullPath));
                    }
                }

                if (allSongs.length > 0) {
                    const songMap = new Map(allSongs.map(song => [song.path, song]));
                    const foundSongs = result.songs
                        .sort((a, b) => a.position - b.position)
                        .map(item => songMap.get(item.song_path))
                        .filter((song): song is Song => song !== undefined && !!song.path);

                    setSongsInPlaylist(foundSongs);
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết playlist:", error);
                navigate("/playlists");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [playlistId, allSongs.length, navigate]);



    const openDeleteConfirmation = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!playlistId) return;
        try {
            await invoke('delete_playlist', { id: playlistId });
            alert("Đã xóa playlist thành công!");
            navigate("/playlists");
        } catch (error) {
            console.error("Lỗi khi xóa playlist:", error);
            alert(`Không thể xóa playlist: ${error}`);
        }
    };

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        setIsScrolled(event.currentTarget.scrollTop > 220);
    };



    // Kiểm tra xem playlist hiện tại có đang được phát hay không
    const isThisPlaylistPlaying = useMemo(() => {
        if (!isPlaying || !currentSong || songsInPlaylist.length === 0) return false;
        return songsInPlaylist.some(song => song.path === currentSong.path);
    }, [isPlaying, currentSong, songsInPlaylist]);

    // Hàm xử lý nút "Phát" chính
    const handlePlayPlaylist = () => {
        if (songsInPlaylist.length === 0) return;

        if (isThisPlaylistPlaying) {
            playPause();
        } else {
            playSong(songsInPlaylist[0], songsInPlaylist, coverImageUrl);
        }
    };

    const handleSaveChanges = async () => {
        if (!playlistId) return;
        try {
            const newSongPaths = songsInPlaylist.map(song => song.path);
            await invoke('update_playlist_songs', { playlistId, newSongPaths });
            setIsEditing(false); // Thoát khỏi chế độ sửa
            alert("Đã lưu thay đổi thành công!");
        } catch (error) {
            console.error("Lỗi khi lưu thứ tự playlist:", error);
            alert(`Không thể lưu thay đổi: ${error}`);
        }
    };

    const handleStartEditing = () => {
        setOriginalSongsOrder([...songsInPlaylist]); // Quan trọng: tạo một bản sao
        setIsEditing(true);
    };

    // ✅ Bước 4: Tạo hàm mới để HỦY thay đổi
    const handleCancelChanges = () => {
        setSongsInPlaylist(originalSongsOrder); // Khôi phục từ bản sao đã lưu
        setIsEditing(false);
    };

    // Lọc ra các bài hát chưa có trong playlist hiện tại
    const availableSongs = useMemo(() => {
        const currentPlaylistPaths = new Set(songsInPlaylist.map(song => song.path));
        return allSongs.filter(song => !currentPlaylistPaths.has(song.path));
    }, [allSongs, songsInPlaylist]);

    // Lọc các bài hát có sẵn dựa trên thanh tìm kiếm
    const filteredAvailableSongs = useMemo(() => {
        if (!searchTerm) return availableSongs;
        return availableSongs.filter(song =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableSongs, searchTerm]);

    // Chọn/Bỏ chọn một bài hát để thêm
    const toggleSongSelection = (songPath: string) => {
        setSelectedSongsToAdd(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(songPath)) newSelection.delete(songPath);
            else newSelection.add(songPath);
            return newSelection;
        });
    };

    const handleAddSelectedSongs = async () => {
        if (!playlistId || selectedSongsToAdd.size === 0) return;

        try {
            const newSongPaths = Array.from(selectedSongsToAdd);

            // Gọi command Rust mới
            await invoke('add_songs_to_playlist', {
                playlistId: playlistId,
                songPathsToAdd: newSongPaths
            });

            // Lấy thông tin đầy đủ của các bài hát đã chọn để cập nhật UI
            const songsToAdd = allSongs.filter(song => selectedSongsToAdd.has(song.path));

            // Cập nhật lại state của UI để người dùng thấy kết quả ngay lập tức
            setSongsInPlaylist(prevSongs => [...prevSongs, ...songsToAdd]);

            alert(`Đã thêm ${selectedSongsToAdd.size} bài hát vào playlist thành công!`);

            // Đóng giao diện và reset state
            setIsAddingSongs(false);
            setSelectedSongsToAdd(new Set());
            setSearchTerm("");

        } catch (error) {
            console.error("Lỗi khi thêm bài hát vào playlist:", error);
            alert(`Không thể thêm bài hát: ${error}`);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSongsInPlaylist((songs) => {
                const oldIndex = songs.findIndex((song) => song.path === active.id);
                const newIndex = songs.findIndex((song) => song.path === over.id);
                return arrayMove(songs, oldIndex, newIndex);
            });
        }
    };

    if (isLoading || !playlistDetails) {
        return <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] text-white">Đang tải...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] text-white w-[450px] mx-auto  overflow-hidden">
            {/* Header động */}
            <div className={`sticky top-0 z-20 px-6 pt-8 pb-4 transition-all duration-300 ${isScrolled ? 'bg-[#1a0d2e]/80 backdrop-blur-lg' : 'bg-transparent'}`}>
                <div className="relative flex items-center justify-between">

                    {/* NHÓM CÁC NÚT ĐIỀU HƯỚNG BÊN TRÁI */}
                    <div className="flex items-center gap-3">
                        {/* Nút Quay lại Playlist */}
                        <button
                            onClick={() => navigate("/playlists")}
                            title="Quay Lại"
                            className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all"
                        >
                            <ArrowLeft size={22} className="text-purple-300" />
                        </button>

                        {/* Nút Về trang Home (Mới thêm) */}
                        <button
                            onClick={() => navigate("/")}
                            title="Trang chủ"
                            className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all"
                        >
                            <Home size={22} className="text-violet-400" />
                        </button>
                    </div>

                    {/* Tiêu đề ở giữa (Tuyệt đối) */}
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : -10 }}
                        className="text-lg font-semibold tracking-wide truncate absolute left-1/2 -translate-x-1/2 max-w-[150px] text-center"
                    >
                        {playlistDetails.name}
                    </motion.h1>

                    {/* Nút Xóa bên phải */}
                    <button
                        onClick={openDeleteConfirmation}
                        title="Xóa Playlist"
                        className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 transition-all"
                    >
                        <Trash2 size={22} className="text-red-400" />
                    </button>
                </div>
            </div>

            {/* Phần thân trang */}
            <div onScroll={handleScroll} className="flex-1 overflow-y-auto [scrollbar-width:none] -mt-[88px] ">
                <div className="relative h-80 w-full flex flex-col items-center justify-center p-6 text-center">
                    {/* Ảnh nền mờ */}
                    <div className="absolute inset-0 overflow-hidden">
                        {coverImageUrl ? (
                            <img src={coverImageUrl} alt="" className="w-full h-full object-cover blur-md opacity-60" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-800 to-pink-700 opacity-50"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#120922] via-[#120922]/70 to-transparent"></div>
                    </div>

                    {/* Nội dung chính */}
                    <div className="relative z-10 flex flex-col items-center pt-40">
                        {/* Ảnh bìa nhỏ, sắc nét */}
                        <div className="w-40 h-40 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                            {coverImageUrl ? (
                                <img src={coverImageUrl} alt={playlistDetails.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-700 to-pink-600 flex items-center justify-center">
                                    <Music2 size={60} className="text-white/30" />
                                </div>
                            )}
                            
                        </div>
                        <h2 className="mt-4 text-3xl font-bold">{playlistDetails.name}</h2>
                        <p className="text-sm text-gray-300 mt-1">{songsInPlaylist.length} bài hát</p>
                    </div>
                </div>

                {/* Danh sách bài hát và nút Play */}
                <div className="bg-[#120922] rounded-t-3xl -mt-6 relative z-10 pt-4">
                    <div className="px-6 pb-4">
                        <button
                            onClick={handlePlayPlaylist}
                            className={`w-full font-bold py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${isThisPlaylistPlaying ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                        >
                            {isThisPlaylistPlaying ? <Pause size={20} /> : <Play size={20} />}
                            {isThisPlaylistPlaying ? 'Đang phát' : 'Phát'}
                        </button>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSaveChanges}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-2 rounded-full shadow-lg transition-all hover:opacity-90 flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} />
                                        Lưu
                                    </button>
                                    <button
                                        onClick={handleCancelChanges}
                                        className="flex-1 bg-zinc-600 hover:bg-zinc-700 text-white font-semibold py-2 rounded-full shadow-md transition-colors flex items-center justify-center gap-2"
                                    >
                                        <X size={18} />
                                        Hủy
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleStartEditing} // Dùng hàm mới
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-full shadow-md transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => setIsAddingSongs(true)}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-full shadow-md transition-colors flex items-center justify-center gap-2">
                                        <Plus size={18} />
                                        Thêm
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="px-6 pb-6 space-y-3">
                        <DndContext
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={songsInPlaylist.map(song => song.path)}
                                strategy={verticalListSortingStrategy}
                            >
                                {songsInPlaylist.map((song, index) => {
                                    const isActive = currentSong?.path === song.path;

                                    return (
                                        <DraggableSongItem
                                            key={song.path}
                                            id={song.path}
                                            song={song}
                                            index={index}
                                            isEditing={isEditing}
                                            isActive={isActive}
                                            isPlaying={isActive && isPlaying}
                                            onPlay={() => {
                                                if (isActive) {
                                                    playPause();
                                                } else {
                                                    playSong(song, songsInPlaylist, coverImageUrl);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </SortableContext>
                        </DndContext>
                        {songsInPlaylist.length === 0 && (
                            <div className="text-center py-10 text-gray-400 opacity-60">
                                <Music2 size={40} className="mx-auto mb-2" />
                                <p>Playlist chưa có bài hát nào</p>
                                <p className="text-xs">Nhấn "Thêm" để bắt đầu</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <AnimatePresence>
                {isAddingSongs && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "100%" }}
                        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                        className="absolute inset-0 z-50 flex flex-col bg-[#0f0a1a] h-full"
                    >
                        {/* Header của Overlay */}
                        <div className="sticky top-0 z-20 px-6 pt-8 pb-4 bg-[#1a0d2e]/80 backdrop-blur-lg">
                            <div className="relative flex items-center justify-center">
                                <button onClick={() => setIsAddingSongs(false)} title="Quay lại" className="absolute left-0 p-2 rounded-full hover:bg-white/15 transition-colors"><ArrowLeft size={22} className="text-purple-300" /></button>
                                <h1 className="text-lg font-semibold tracking-wide">Thêm vào Playlist</h1>
                            </div>
                        </div>

                        {/* Phần thân của Overlay */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none]">
                            {/* Thanh tìm kiếm */}
                            <div className="relative mb-4">
                                <input type="text" placeholder="Tìm kiếm bài hát..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 outline-none focus:border-purple-400 transition" />
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* Danh sách bài hát để chọn (Logic từ PlaylistAdd) */}
                            <div className="pb-24 space-y-2">
                                {filteredAvailableSongs.map((song) => {
                                    const isSelected = !!song.path && selectedSongsToAdd.has(song.path);
                                    return (
                                        <div key={song.path} onClick={() => song.path && toggleSongSelection(song.path)} className={`flex items-center justify-between rounded-lg p-2 border transition-all duration-200 cursor-pointer ${isSelected ? 'bg-purple-500/30 border-purple-400/50' : 'bg-white/5 hover:bg-white/10 border-transparent'}`}>
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

                        {/* Nút "Thêm" cố định ở dưới */}
                        <div className="sticky bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-[#0f0a1a] via-[#0f0a1a]/90 to-transparent">
                            <button onClick={handleAddSelectedSongs} disabled={selectedSongsToAdd.size === 0} className={`w-full font-bold py-3 rounded-full shadow-lg transition-all duration-300 ${selectedSongsToAdd.size > 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                                Thêm ({selectedSongsToAdd.size}) bài hát
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Xóa Playlist "${playlistDetails.name}"`}
                message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
            />
        </div>
    );
};

export default PlaylistDetail;