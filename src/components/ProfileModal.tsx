import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaUser, FaHeart } from 'react-icons/fa';
import AlbumCover from './AlbumCover';
import type { UserProfile, Album } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  albums: Album[];
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

export default function ProfileModal({ isOpen, onClose, profile, albums, onSave }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [favoriteAlbumId, setFavoriteAlbumId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile?.displayName || '');
      setPhotoURL(profile?.photoURL || '');
      setFavoriteAlbumId(profile?.favoriteAlbumId ?? null);
    }
  }, [isOpen, profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Le nom ne peut pas être vide');
      return;
    }
    setSaving(true);
    try {
      await onSave({ displayName: name.trim(), photoURL: photoURL.trim(), favoriteAlbumId });
      toast.success('Profil mis à jour !');
      onClose();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const favAlbum = albums.find((a) => a.id === favoriteAlbumId);

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box bg-base-200 border border-white/5 p-4 sm:p-5">
        <h3 className="font-semibold text-base mb-4 sm:mb-5">Modifier le profil</h3>

        {/* Avatar preview */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 bg-base-300 flex items-center justify-center">
            {photoURL.trim() ? (
              <img src={photoURL.trim()} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <FaUser className="text-2xl text-base-content/20" />
            )}
          </div>
        </div>

        {/* Photo URL */}
        <label className="text-xs text-base-content/40 mb-1 block">URL de la photo</label>
        <input
          type="url"
          placeholder="https://exemple.com/photo.jpg"
          className="w-full px-4 py-3 rounded-xl bg-base-300 border border-white/5 text-sm placeholder:text-base-content/30 focus:outline-none focus:border-spotify/50 transition-colors mb-4"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
        />

        {/* Name */}
        <label className="text-xs text-base-content/40 mb-1 block">Nom d'affichage</label>
        <input
          type="text"
          placeholder="Ton prénom..."
          className="w-full px-4 py-3 rounded-xl bg-base-300 border border-white/5 text-sm placeholder:text-base-content/30 focus:outline-none focus:border-spotify/50 transition-colors mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
        />

        {/* Favorite album */}
        <label className="text-xs text-base-content/40 mb-1 block flex items-center gap-1">
          <FaHeart className="text-error text-[10px]" /> Album préféré
        </label>
        {albums.length > 0 ? (
          <select
            className="w-full px-4 py-3 rounded-xl bg-base-300 border border-white/5 text-sm focus:outline-none focus:border-spotify/50 transition-colors"
            value={favoriteAlbumId || ''}
            onChange={(e) => setFavoriteAlbumId(e.target.value || null)}
          >
            <option value="">Aucun</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.artist}</option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-base-content/30 mb-2">Ajoute des albums d'abord</p>
        )}

        {/* Fav preview */}
        {favAlbum && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-base-300/50 border border-white/5">
            <AlbumCover src={favAlbum.coverUrl} alt={favAlbum.name} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{favAlbum.name}</p>
              <p className="text-[10px] text-base-content/40 truncate">{favAlbum.artist}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-5 justify-end">
          <button className="px-4 py-2 rounded-lg text-sm text-base-content/50 hover:text-base-content transition-colors" onClick={onClose}>
            Annuler
          </button>
          <button
            className="px-5 py-2 rounded-lg text-sm font-medium bg-spotify text-black hover:bg-spotify-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-sm">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

