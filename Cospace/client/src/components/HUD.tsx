import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Map as MapIcon, Zap, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const HUD: React.FC = () => {
  const { user, setUser, clearChat, onlineCount, currentZoneName, interactionPrompt, interactionMessage } = useAppStore();
  const [showUpdate, setShowUpdate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowUpdate(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cosmos_token');
    localStorage.removeItem('cosmos_user');
    setUser(null, null);
    clearChat();
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 font-mono">
      {/* Top Left: Online Count */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black border-l-4 border-emerald-500 px-5 py-3 flex items-center gap-3 shadow-xl"
        >
          <div className="w-3 h-3 bg-emerald-500 rounded-sm animate-pulse"></div>
          <span className="text-white text-sm font-black tracking-tighter">
            {onlineCount} ONLINE
          </span>
          <div className="h-4 w-px bg-white/20"></div>
          <span className="text-emerald-500 text-[10px] font-bold">
             SYNC ACTIVE
          </span>
        </motion.div>
      </div>

      {/* Top Right: User Info & Logout */}
      <div className="absolute top-6 right-6 pointer-events-auto flex items-center gap-2">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black px-6 py-3 border border-white/10 flex items-center"
        >
          <span className="text-xs text-slate-500 font-black uppercase tracking-widest mr-2">LOGGED IN AS</span>
          <span className="text-emerald-500 text-base font-black uppercase">{user.username}</span>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleLogout}
          className="bg-emerald-500 hover:bg-emerald-400 px-8 py-3 text-black text-sm font-black uppercase tracking-tighter shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          Logout
        </motion.button>
      </div>

      {/* Top Center: System Update Notification */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <AnimatePresence>
          {showUpdate && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-500/10 border border-emerald-500/50 backdrop-blur-xl px-6 py-3 flex items-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            >
              <Zap className="w-5 h-5 text-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">System Overhaul Complete</span>
                <span className="text-emerald-500 text-[9px] font-bold uppercase opacity-80">Particles, Interactions & Markers Active</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Right: Mini-map (Visual representation) */}
      <div className="absolute top-24 right-6 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-40 h-40 bg-black/80 border border-white/10 p-2 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-1 left-2 text-[8px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
            <MapIcon className="w-2 h-2" /> Live Radar
          </div>
          {/* Simple Room Indicators */}
          <div className="absolute w-8 h-6 bg-emerald-500/20 border border-emerald-500/40" style={{ left: '40%', top: '20%' }}></div>
          <div className="absolute w-6 h-6 bg-emerald-500/20 border border-emerald-500/40" style={{ left: '10%', top: '60%' }}></div>
          <div className="absolute w-6 h-6 bg-emerald-500/20 border border-emerald-500/40" style={{ left: '60%', top: '60%' }}></div>
          <div className="absolute w-6 h-6 bg-emerald-500/20 border border-emerald-500/40" style={{ left: '80%', top: '50%' }}></div>
          
          {/* Scanning line animation */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[1px] bg-emerald-500/30 z-10"
          />
        </motion.div>
      </div>

      {/* Bottom Left: Vcosmos Office & Location */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-2">
            <span className="text-4xl font-black text-emerald-500 tracking-tighter leading-none">Vcosmos</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-emerald-500 tracking-tighter leading-none">Office</span>
            <div className="bg-emerald-500 p-1">
              <ArrowRight className="w-8 h-8 text-black" />
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {currentZoneName && (
              <motion.div
                key={currentZoneName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="mt-4 flex items-center gap-2 border-l-2 border-emerald-500/50 pl-4 py-1"
              >
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">CURRENT SECTOR</div>
                <div className="text-white text-sm font-black uppercase tracking-tight">
                  {currentZoneName}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Center: Interaction Success Message */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none">
        <AnimatePresence>
          {interactionMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500 px-4 py-1 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest italic">
                  {interactionMessage}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Center: Interaction Prompt */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
        <AnimatePresence>
          {interactionPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-emerald-500 text-black px-6 py-2 border border-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <span className="text-xs font-black uppercase tracking-widest italic">
                {interactionPrompt}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Protocol Instructions (Moved to bottom right) */}
      <div className="absolute bottom-6 right-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 border border-white/5 px-4 py-2 rounded flex flex-col gap-1 items-end"
        >
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest text-right">Protocol Instructions</div>
          <div className="text-[10px] text-white/70 font-mono text-right">[WASD] Navigate Space</div>
          <div className="text-[10px] text-white/70 font-mono text-right">[PROXIMITY] Automatic Uplink</div>
        </motion.div>
      </div>
    </div>
  );
};
