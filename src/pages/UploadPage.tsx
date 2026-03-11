import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, MediaType } from '../lib/types';
import { saveArtwork, signInWithGoogle } from '../lib/firebase';
import { ArrowLeft, Upload as UploadIcon, MapPin } from 'lucide-react';
import Map, { Marker } from 'react-map-gl';
import { clsx } from 'clsx';
import { Navigation } from '../components/Navigation';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiaGFyc2h5YWRhdmhhcHB5IiwiYSI6ImNsczB2b252MDBhN2Qya21zZ254Z254Z24ifQ.demo';

const categories: { id: Category; label: string; color: string }[] = [
  { id: 'visual', label: 'Visual', color: '#4488FF' },
  { id: 'graffiti', label: 'Graffiti', color: '#FF3333' },
  { id: 'music', label: 'Music', color: '#FFD700' },
  { id: 'dance', label: 'Dance', color: '#44FF88' },
  { id: 'poetry', label: 'Poetry', color: '#FF8844' },
  { id: 'digital', label: 'Digital', color: '#AA44FF' },
  { id: 'sculpture', label: 'Sculpture', color: '#EEEEEE' },
];

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [category, setCategory] = useState<Category>('visual');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('0.99');
  const [location, setLocation] = useState({ lat: 52.2053, lng: 0.1218 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Auto-login for demo
    signInWithGoogle().then(res => {
      if (res?.user?.displayName) {
        setArtistName(res.user.displayName);
      }
    }).catch(console.error);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err)
      );
    }
  }, []);

  const handleMediaUpload = () => {
    // Mock Cloudinary upload for demo
    const url = prompt("Enter media URL (e.g., https://picsum.photos/800/600):", "https://picsum.photos/seed/newart/800/600");
    if (url) {
      setMediaUrl(url);
      setMediaType(url.endsWith('.mp4') ? 'video' : url.endsWith('.mp3') ? 'audio' : 'image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaUrl) return;

    setIsSubmitting(true);
    try {
      await saveArtwork({
        title,
        artistName: artistName || 'Anonymous',
        artistId: 'demo-user',
        category,
        mediaUrl,
        mediaType,
        lat: location.lat,
        lng: location.lng,
        isPaid,
        price: isPaid ? parseFloat(price) : undefined,
        likes: 0,
        createdAt: new Date(),
        isActive: true
      });
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <MapPin size={48} className="text-accent" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-white mb-4">Your art is live!</h1>
        <p className="text-text-secondary mb-8">It has been pinned to the world.</p>
        <button 
          onClick={() => navigate('/map')}
          className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors"
        >
          View on Map
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-20 p-4 flex items-center border-b border-white/10">
        <button onClick={() => navigate('/map')} className="p-2 mr-4 text-white">
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-heading font-bold text-white">Pin New Art</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8 max-w-md mx-auto">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="Give it a name..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Artist</label>
            <input 
              type="text" 
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="Your name..."
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all border",
                  category === c.id ? "bg-white/10 text-white" : "bg-transparent text-text-secondary border-white/10 hover:border-white/30"
                )}
                style={{ borderColor: category === c.id ? c.color : undefined }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Media</label>
          {mediaUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-surface">
              {mediaType === 'image' && <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />}
              {mediaType === 'video' && <video src={mediaUrl} className="w-full h-full object-cover" controls />}
              {mediaType === 'audio' && <div className="w-full h-full flex items-center justify-center"><audio src={mediaUrl} controls /></div>}
              <button 
                type="button"
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white text-xs"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMediaUpload}
              className="w-full aspect-video bg-surface border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-text-secondary hover:text-white hover:border-white/40 transition-colors"
            >
              <UploadIcon size={32} className="mb-2" />
              <span>Tap to upload media</span>
              <span className="text-xs opacity-50 mt-1">Image, Video, or Audio (Max 50MB)</span>
            </button>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Location Pin</label>
          <div className="h-[300px] rounded-xl overflow-hidden border border-white/10 relative">
            <Map
              longitude={location.lng}
              latitude={location.lat}
              zoom={15}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
              onMove={e => setLocation({ lat: e.viewState.latitude, lng: e.viewState.longitude })}
            >
              <Marker longitude={location.lng} latitude={location.lat} anchor="bottom" draggable onDragEnd={e => setLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng })}>
                <MapPin size={32} className="text-accent drop-shadow-lg" />
              </Marker>
            </Map>
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono text-white/70">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-white">Pricing</span>
            <div className="flex bg-black/50 rounded-full p-1 border border-white/10">
              <button type="button" onClick={() => setIsPaid(false)} className={clsx("px-4 py-1 rounded-full text-sm font-bold transition-colors", !isPaid ? "bg-white text-black" : "text-text-secondary")}>Free</button>
              <button type="button" onClick={() => setIsPaid(true)} className={clsx("px-4 py-1 rounded-full text-sm font-bold transition-colors", isPaid ? "bg-accent text-white" : "text-text-secondary")}>Paid</button>
            </div>
          </div>
          {isPaid && (
            <div className="flex items-center gap-2">
              <span className="text-xl text-text-secondary">£</span>
              <input 
                type="number" 
                step="0.01" 
                min="0.30" 
                max="9.99"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="bg-transparent text-2xl font-mono text-white focus:outline-none w-full"
              />
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={isSubmitting || !title || !mediaUrl}
          className="w-full bg-accent hover:bg-accent/90 disabled:bg-surface disabled:text-text-secondary text-white font-bold py-4 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(68,136,255,0.3)]"
        >
          {isSubmitting ? 'Pinning...' : 'Pin to the World 📍'}
        </button>
      </form>

      <Navigation />
    </div>
  );
};
