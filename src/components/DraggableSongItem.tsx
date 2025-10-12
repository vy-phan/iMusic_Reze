import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Play } from 'lucide-react';
import { Song } from '..';

interface DraggableSongItemProps {
    song: Song;
    id: string;
    index: number;
    isEditing: boolean;
    onPlay: () => void;
}

export const DraggableSongItem = ({ song, id, index, isEditing, onPlay }: DraggableSongItemProps) => {
    // ✅ Hook chính của dnd-kit cho danh sách sắp xếp
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: id });

    // ✅ Style để áp dụng hiệu ứng kéo và chuyển động
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        // zIndex cao hơn khi kéo để nó nổi lên trên các item khác
        zIndex: isDragging ? 10 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // `attributes` chứa các thuộc tính ARIA cần thiết
            {...attributes}
            className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 relative"
        >
            <div className="flex items-center gap-4">
                {isEditing ? (
                    // ✅ `listeners` chứa các sự kiện onMouseDown, onKeyDown... để bắt đầu kéo
                    <div {...listeners} className="cursor-grab text-gray-500 touch-none">
                        <GripVertical size={20} />
                    </div>
                ) : (
                    <span className="text-sm text-gray-400 w-6 text-center">{index + 1}</span>
                )}
                <div>
                    <h3 className="text-base font-medium text-white/90 truncate max-w-[200px]">{song.title}</h3>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{song.duration}</span>
                {!isEditing && (
                    <button onClick={onPlay} className="p-2 rounded-lg hover:bg-purple-600/40 transition-colors">
                        <Play size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};