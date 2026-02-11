import { FaSpotify, FaPlus, FaSignOutAlt, FaUserEdit, FaUser, FaUsers } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../types';

interface NavbarProps {
  onAddClick: () => void;
  user: User | null;
  profile: UserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onEditProfile: () => void;
  onFollowingClick: () => void;
}

export default function Navbar({ onAddClick, user, profile, onSignIn, onSignOut, onEditProfile, onFollowingClick }: NavbarProps) {
  const displayName = profile?.displayName || user?.displayName || 'User';
  const photoURL = profile?.photoURL || user?.photoURL || '';

  return (
    <div className="bg-base-200/95 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50 safe-top">
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center gap-2">
        <FaSpotify className="text-spotify text-xl sm:text-2xl" />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {user ? (
          <>
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 text-base-content/50 flex items-center justify-center active:bg-white/10 transition-colors"
              onClick={onFollowingClick}
              title="Mes suivis"
            >
              <FaUsers className="text-xs sm:text-sm" />
            </button>
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-spotify text-black flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-spotify/20"
              onClick={onAddClick}
            >
              <FaPlus className="text-xs sm:text-sm" />
            </button>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-white/10 active:ring-spotify/50 transition-all cursor-pointer bg-base-300 flex items-center justify-center">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-xs sm:text-sm text-base-content/30" />
                )}
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-200 border border-white/10 rounded-xl shadow-xl mt-2 w-48 sm:w-52 p-2 z-50">
                <li className="px-3 py-2 text-xs text-base-content/40 pointer-events-none truncate">
                  {displayName}
                </li>
                <li>
                  <button onClick={onEditProfile} className="text-sm flex items-center gap-2 active:bg-white/10">
                    <FaUserEdit className="text-xs" />
                    Modifier le profil
                  </button>
                </li>
                <li>
                  <button onClick={onSignOut} className="text-sm text-error/80 active:text-error flex items-center gap-2 active:bg-error/10">
                    <FaSignOutAlt className="text-xs" />
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <button
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-black text-sm font-medium active:bg-white/90 transition-colors"
            onClick={onSignIn}
          >
            <FcGoogle className="text-base" />
            <span className="hidden sm:inline">Connexion</span>
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

