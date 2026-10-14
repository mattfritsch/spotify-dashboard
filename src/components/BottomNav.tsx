import { FaThLarge, FaChartBar, FaPlus, FaUsers, FaUser } from 'react-icons/fa';

export type Tab = 'dashboard' | 'stats' | 'following';

interface BottomNavProps {
  active: string;
  onTab: (tab: Tab) => void;
  onAdd: () => void;
  onProfile: () => void;
}

export default function BottomNav({ active, onTab, onAdd, onProfile }: BottomNavProps) {
  const item = (tab: Tab, icon: React.ReactNode, label: string) => (
    <button
      aria-label={label}
      className={`flex-1 min-h-14 flex flex-col items-center justify-center gap-0.5 text-[10px] active:bg-white/5 ${
        active === tab ? 'text-spotify' : 'text-base-content/40'
      }`}
      onClick={() => onTab(tab)}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-base-200/95 backdrop-blur-lg border-t border-white/5 safe-bottom">
      <div className="flex items-center">
        {item('dashboard', <FaThLarge className="text-base" />, 'Albums')}
        {item('stats', <FaChartBar className="text-base" />, 'Stats')}
        <div className="flex-1 flex justify-center">
          <button
            aria-label="Ajouter un album"
            className="-mt-5 w-14 h-14 rounded-full bg-spotify text-black flex items-center justify-center shadow-lg shadow-spotify/30 active:scale-95 transition-transform"
            onClick={onAdd}
          >
            <FaPlus />
          </button>
        </div>
        {item('following', <FaUsers className="text-base" />, 'Suivis')}
        <button
          aria-label="Profil"
          className="flex-1 min-h-14 flex flex-col items-center justify-center gap-0.5 text-[10px] text-base-content/40 active:bg-white/5"
          onClick={onProfile}
        >
          <FaUser className="text-base" />
          Profil
        </button>
      </div>
    </nav>
  );
}
