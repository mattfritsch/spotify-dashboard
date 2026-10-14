import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaHeart, FaSpotify, FaPaperPlane } from 'react-icons/fa';
import AlbumCover from './AlbumCover';
import { getReactions, setLike, addComment } from '../services/firestore';
import type { Album, Comment } from '../types';

interface Props {
  album: Album;
  ownerUid: string;
  me: { uid: string; name: string };
  onClose: () => void;
}

export default function FriendAlbumSheet({ album, ownerUid, me, onClose }: Props) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getReactions(ownerUid, album.id, me.uid)
      .then((r) => {
        if (cancelled) return;
        setLikes(r.likes);
        setLiked(r.liked);
        setComments(r.comments);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [ownerUid, album.id, me.uid]);

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    navigator.vibrate?.(8);
    try {
      await setLike(ownerUid, album.id, me.uid, next);
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
      toast.error('Impossible de liker');
    }
  };

  const send = async () => {
    const t = text.trim().slice(0, 280);
    if (!t) return;
    const c = { uid: me.uid, name: me.name, text: t, at: new Date().toISOString() };
    try {
      const id = await addComment(ownerUid, album.id, c);
      setComments((prev) => [...prev, { ...c, id }]);
      setText('');
    } catch {
      toast.error('Commentaire impossible à envoyer');
    }
  };

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle" onCancel={onClose}>
      <div className="modal-box bg-base-200 border border-white/5 p-4 safe-bottom">
        <div className="flex gap-3 items-center">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg">
            <AlbumCover src={album.coverUrl} alt={album.name} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight truncate">{album.name}</h3>
            <p className="text-sm text-base-content/50 truncate">{album.artist}</p>
          </div>
          <button aria-label="J'aime" className="w-12 h-12 flex flex-col items-center justify-center active:scale-125 transition-transform" onClick={toggleLike}>
            <FaHeart className={`text-xl ${liked ? 'text-error' : 'text-white/20'}`} />
            <span className="text-[10px] text-base-content/40">{likes}</span>
          </button>
        </div>

        <a href={album.spotifyUrl} target="_blank" rel="noreferrer" className="mt-3 min-h-11 rounded-full bg-spotify text-black text-sm font-semibold flex items-center justify-center gap-2">
          <FaSpotify /> Écouter
        </a>

        <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
          {failed && <p className="text-xs text-base-content/30">Réactions indisponibles</p>}
          {comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium">{c.name}</span> <span className="text-base-content/70">{c.text}</span>
            </div>
          ))}
          {!failed && comments.length === 0 && <p className="text-xs text-base-content/30">Sois le premier à commenter</p>}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            className="flex-1 px-4 min-h-11 rounded-full bg-base-300 border border-white/5 focus:outline-none focus:border-spotify/50"
            placeholder="Ajouter un commentaire…"
            maxLength={280}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button aria-label="Envoyer" className="w-11 h-11 rounded-full bg-spotify text-black flex items-center justify-center disabled:opacity-30" disabled={!text.trim()} onClick={send}>
            <FaPaperPlane className="text-sm" />
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-sm">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
