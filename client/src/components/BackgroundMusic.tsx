import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export const BackgroundMusic: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (hasInteracted && audioRef.current) {
      audioRef.current.volume = 0.15; // Subtle volume
      audioRef.current.play().catch(err => console.log('Playback blocked:', err));
      setIsPlaying(true);
    }
  }, [hasInteracted]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" // Lofi/Ambient style
        loop
      />
      
      <div className="fixed bottom-6 left-6 z-50 pointer-events-auto">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleMusic}
          className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-emerald-500/20 transition-all group"
          title={isPlaying ? 'Mute Atmosphere' : 'Play Atmosphere'}
        >
          {isPlaying ? (
            <Volume2 className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-500 group-hover:scale-110 transition-transform" />
          )}
        </motion.button>
      </div>
    </>
  );
};
