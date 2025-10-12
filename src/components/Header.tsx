import { Menu, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  artist: string;
}

export default function Header({ title, artist }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-4">
        <button
          onClick={() => navigate("/list")}
          className="text-white hover:text-gray-300 transition-colors">
          <Menu size={24} />
        </button>

        <div className="text-center">
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-sm text-gray-400">{artist}</p>
        </div>

        <button
          onClick={() => navigate("/settings")}
          className="text-white hover:text-gray-300 transition-colors">
          <Settings size={24} />
        </button>
      </div>

    </>
  );
}
