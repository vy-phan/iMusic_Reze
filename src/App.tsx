import { BrowserRouter, Routes, Route } from "react-router-dom";
import Player from "./pages/Player";
import Setting from "./pages/Setting";
import ListMusic from "./pages/ListMusic";
import { AudioProvider } from "./contexts/AudioContext";
import Playlists from "./pages/Playlists";
import PlaylistAdd from "./pages/PlaylistAdd";
import PlaylistDetail from "./pages/PlaylistDetail";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

function App() {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <BrowserRouter >
      <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            // onDragEnd sẽ được xử lý trong PlaylistDetail
        >
            <AudioProvider>
                <Routes>
                    <Route path="/" element={<Player />} />
                    <Route path="/list" element={<ListMusic />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/playlists/add" element={<PlaylistAdd />} />
                    <Route path="/playlists/:id" element={<PlaylistDetail />} />
                    <Route path="/settings" element={<Setting />} />
                </Routes>
            </AudioProvider>
        </DndContext>
    </BrowserRouter>
  );
}

export default App;

// C:\Users\Dell\AppData\Roaming\com.dell.i-music