import { useState } from 'react';
import { FaCompactDisc } from 'react-icons/fa';

interface AlbumCoverProps {
  src?: string;
  alt: string;
  size?: 'full' | 'sm';
  className?: string;
}

export default function AlbumCover({ src, alt, size = 'full', className = '' }: AlbumCoverProps) {
  const [failed, setFailed] = useState(false);

  const showFallback = !src || failed;

  const iconSize = size === 'sm' ? 'text-base' : 'text-4xl';
  const roundedClass = size === 'sm' ? 'rounded-md' : '';
  const sizeClass = size === 'sm' ? 'w-10 h-10' : 'w-full h-full';

  if (showFallback) {
    return (
      <div className={`${sizeClass} ${roundedClass} bg-base-300 flex items-center justify-center ${className}`}>
        <FaCompactDisc className={`${iconSize} text-base-content/10`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} ${roundedClass} object-cover ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

