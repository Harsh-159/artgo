import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtworkById } from '../lib/firebase';
import { Artwork } from '../lib/types';
import { ArrowLeft } from 'lucide-react';
import { UnlockModal } from '../components/UnlockModal';
import { LikeButton } from '../components/LikeButton';

export const ARPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      getArtworkById(id).then(data => {
        if (data) {
          setArtwork(data);
          const unlocked = localStorage.getItem(`unlocked_${data.id}`) === 'true';
          if (data.isPaid && !unlocked) {
            setIsLocked(true);
          }
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (artwork && !isLocked && sceneRef.current) {
      // Inject A-Frame scene
      let entityHtml = '';
      
      if (artwork.mediaType === 'image') {
        entityHtml = `
          <a-image
            src="${artwork.mediaUrl}"
            look-at="[gps-camera]"
            gps-entity-place="latitude: ${artwork.lat}; longitude: ${artwork.lng}"
            scale="20 20 1"
            material="transparent: true; alphaTest: 0.1">
          </a-image>
        `;
      } else if (artwork.mediaType === 'video') {
        entityHtml = `
          <a-assets>
            <video id="arVideo" src="${artwork.mediaUrl}" autoplay loop crossorigin="anonymous" playsinline></video>
          </a-assets>
          <a-video
            src="#arVideo"
            look-at="[gps-camera]"
            gps-entity-place="latitude: ${artwork.lat}; longitude: ${artwork.lng}"
            width="16" height="9">
          </a-video>
        `;
      } else if (artwork.mediaType === 'audio') {
        entityHtml = `
          <a-box color="#4488FF" position="-2 0 -5" depth="1" height="1" width="1" gps-entity-place="latitude: ${artwork.lat}; longitude: ${artwork.lng}">
            <a-animation attribute="height" from="1" to="5" dur="500" dir="alternate" repeat="indefinite"></a-animation>
          </a-box>
          <a-box color="#FF3333" position="0 0 -5" depth="1" height="1" width="1" gps-entity-place="latitude: ${artwork.lat}; longitude: ${artwork.lng}">
            <a-animation attribute="height" from="1" to="8" dur="400" dir="alternate" repeat="indefinite"></a-animation>
          </a-box>
          <a-box color="#FFD700" position="2 0 -5" depth="1" height="1" width="1" gps-entity-place="latitude: ${artwork.lat}; longitude: ${artwork.lng}">
            <a-animation attribute="height" from="1" to="4" dur="600" dir="alternate" repeat="indefinite"></a-animation>
          </a-box>
        `;
      }

      const sceneHtml = `
        <a-scene
          embedded
          arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false"
          vr-mode-ui="enabled: false"
          renderer="antialias: true; alpha: true"
        >
          <a-camera gps-camera rotation-reader></a-camera>
          ${entityHtml}
        </a-scene>
      `;

      sceneRef.current.innerHTML = sceneHtml;

      if (artwork.mediaType === 'audio') {
        const audio = new Audio(artwork.mediaUrl);
        audio.loop = true;
        audio.play().catch(e => console.error("Audio play failed", e));
        return () => audio.pause();
      }
    }
  }, [artwork, isLocked]);

  const handleUnlock = () => {
    setIsLocked(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!artwork) return <div className="h-screen bg-background flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* AR Scene Container */}
      {!isLocked && (
        <div ref={sceneRef} className="absolute inset-0 z-0" />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <button 
            onClick={() => navigate('/map')}
            className="w-12 h-12 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 pointer-events-auto hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" />
          </button>
        </div>

        {/* Bottom Card */}
        <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between pointer-events-auto">
          <div>
            <h2 className="text-xl font-heading font-bold text-white">{artwork.title}</h2>
            <p className="text-sm text-text-secondary">{artwork.artistName}</p>
          </div>
          <LikeButton artworkId={artwork.id} initialLikes={artwork.likes} />
        </div>
      </div>

      {/* Unlock Modal */}
      {isLocked && (
        <UnlockModal 
          artwork={artwork} 
          onUnlock={handleUnlock} 
          onCancel={() => navigate('/map')} 
        />
      )}

      {/* Toast */}
      {showToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg animate-bounce z-50">
          ✨ Unlocked forever
        </div>
      )}
    </div>
  );
};
