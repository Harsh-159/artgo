import React, { useEffect, useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import { useNavigate } from 'react-router-dom';
import { getArtworks } from '../lib/firebase';
import { Artwork } from '../lib/types';
import { Orb } from '../components/Orb';
import { LikeButton } from '../components/LikeButton';
import { Navigation } from '../components/Navigation';
import { clsx } from 'clsx';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiaGFyc2h5YWRhdmhhcHB5IiwiYSI6ImNsczB2b252MDBhN2Qya21zZ254Z254Z24ifQ.demo';

export const MapPage: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 0.1218,
    latitude: 52.2053,
    zoom: 14
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = getArtworks(setArtworks);
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setViewState(prev => ({
            ...prev,
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          }));
        },
        (err) => console.error(err)
      );
    }

    return () => unsubscribe();
  }, []);

  const handleOrbClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
  };

  return (
    <div className="w-full h-screen bg-background relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center pointer-events-none">
        <h1 className="text-2xl font-heading font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-auto">
          GalleryOS
        </h1>
        <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center pointer-events-auto cursor-pointer">
          <span className="text-sm">👤</span>
        </div>
      </div>

      {/* Map */}
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {artworks.map(artwork => (
          <Marker 
            key={artwork.id} 
            longitude={artwork.lng} 
            latitude={artwork.lat}
            anchor="center"
          >
            <Orb artwork={artwork} onClick={() => handleOrbClick(artwork)} />
          </Marker>
        ))}
      </Map>

      {/* Bottom Sheet Preview */}
      <div className={clsx(
        "absolute bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 transition-transform duration-300 z-30",
        selectedArtwork ? "translate-y-0" : "translate-y-full"
      )}>
        {selectedArtwork && (
          <div className="flex flex-col h-full pb-20">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => setSelectedArtwork(null)} />
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-heading font-bold text-white mb-1">{selectedArtwork.title}</h2>
                <p className="text-text-secondary">by {selectedArtwork.artistName}</p>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-white">
                {selectedArtwork.category}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <LikeButton artworkId={selectedArtwork.id} initialLikes={selectedArtwork.likes} />
            </div>

            <button 
              onClick={() => navigate(`/ar/${selectedArtwork.id}`)}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {selectedArtwork.isPaid && localStorage.getItem(`unlocked_${selectedArtwork.id}`) !== 'true' 
                ? `Unlock £${selectedArtwork.price?.toFixed(2)}` 
                : 'View in AR →'}
            </button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};
