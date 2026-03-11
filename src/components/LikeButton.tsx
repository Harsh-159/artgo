import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { incrementLikes } from '../lib/firebase';
import { clsx } from 'clsx';

export const LikeButton: React.FC<{ artworkId: string; initialLikes: number }> = ({ artworkId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const likedArtworks = JSON.parse(localStorage.getItem('liked_artworks') || '[]');
    setIsLiked(likedArtworks.includes(artworkId));
    setLikes(initialLikes);
  }, [artworkId, initialLikes]);

  const handleLike = async () => {
    if (isLiked) return;

    setIsAnimating(true);
    setLikes(prev => prev + 1);
    setIsLiked(true);
    
    const likedArtworks = JSON.parse(localStorage.getItem('liked_artworks') || '[]');
    localStorage.setItem('liked_artworks', JSON.stringify([...likedArtworks, artworkId]));

    await incrementLikes(artworkId);

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button 
      onClick={handleLike}
      className={clsx(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-all",
        isLiked ? "text-red-500" : "text-text-secondary hover:text-white",
        isAnimating && "scale-110"
      )}
    >
      <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={clsx(isAnimating && "animate-bounce")} />
      <span className="font-mono text-sm">{likes}</span>
    </button>
  );
};
