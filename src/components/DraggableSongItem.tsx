import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pause, Play } from 'lucide-react';
import { Song } from '..';

interface DraggableSongItemProps {
  song: Song;
  id: string;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  isEditing: boolean;
  onPlay: () => void;
}

export const DraggableSongItem = ({
  song,
  id,
  index,
  isActive,
  isEditing,
  isPlaying,
  onPlay,
}: DraggableSongItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 relative border select-none ${
        isActive ? 'border-purple-500 bg-purple-500/10' : 'border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        {isEditing ? (
          <div
            {...listeners}
            className="cursor-grab text-gray-500 active:cursor-grabbing touch-none select-none"
          >
            <GripVertical size={20} />
          </div>
        ) : (
          <span
            className={`text-sm w-6 text-center transition-colors ${
              isActive ? 'text-purple-400 font-bold' : 'text-gray-400'
            }`}
          >
            {index + 1}
          </span>
        )}

        <div>
          <h3
            className={`text-base font-medium truncate max-w-[200px] transition-colors ${
              isActive ? 'text-purple-300' : 'text-white/90'
            }`}
          >
            {song.title}
          </h3>
          <p className="text-sm text-gray-400">{song.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{song.duration}</span>
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ Không ảnh hưởng đến drag
            onPlay();
          }}
          className={`p-2 rounded-lg transition-colors ${
            isPlaying
              ? 'bg-pink-500/80 hover:bg-pink-600 text-white'
              : 'bg-purple-500/80 hover:bg-purple-600/40'
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    </div>
  );
};
