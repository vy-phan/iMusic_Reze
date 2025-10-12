import { Play, ArrowRight, Plus, ListMusic as PlaylistIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Song } from "..";
import AddSongModal from "../components/AddSongModal";
import { useAudioPlayer } from "../contexts/AudioContext"; // ✅ BƯỚC 1: IMPORT HOOK

const ListMusic = () => {
    const navigate = useNavigate();
    const { playlist: songs, playSong, refetchPlaylist } = useAudioPlayer();
    const [isModalOpen, setModalOpen] = useState(false);


    const handleAddSong = () => {
        refetchPlaylist();
    };

    const handlePlaySong = (songToPlay: Song) => {
        playSong(songToPlay);
        navigate("/");
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#1a0d2e] via-[#2d1b3d] to-[#0f0a1a] text-white w-[450px] mx-auto select-none overflow-hidden">
            {/* Header */}
            <div className="relative flex items-center justify-center px-6 pt-8 pb-4">
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
                {songs.map((song, index) => (
                    <div key={song.path} className="flex items-center justify-between backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-2xl p-4 border border-white/10 hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <div>
                            <h3 className="text-base font-medium text-white/90">{index + 1}. {song.title}</h3>
                            <p className="text-sm text-gray-400">{song.artist}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">{song.duration}</span>
                            <button onClick={() => handlePlaySong(song)} className="p-2 rounded-xl bg-purple-600/80 hover:bg-purple-700 transition-all duration-300 shadow-[0_0_8px_rgba(168,85,247,0.5)] hover:scale-105">
                                <Play size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AddSongModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onAddSong={handleAddSong} />
        </div>
    );
};

export default ListMusic;