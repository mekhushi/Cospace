import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { LogIn, UserPlus, Loader2, Check, RefreshCw } from 'lucide-react';

const AVATAR_IMAGES = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
];

export const AuthOverlay: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_IMAGES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useAppStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin 
      ? { username, password } 
      : { username, password, avatar: selectedAvatar };
    
    try {
      const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setUser(data.user, data.token);
      localStorage.setItem('cosmos_token', data.token);
      localStorage.setItem('cosmos_user', JSON.stringify(data.user));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl p-10 bg-[#0A0A0A] border border-white/5 rounded-sm shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            <span className="text-emerald-500">Virtual</span>Cosmos
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Create Identity</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono text-sm"
                  placeholder="USERNAME"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="flex flex-col items-center">
                <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-4">Choose Avatar</label>
                <div className="grid grid-cols-3 gap-3">
                  {AVATAR_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(img)}
                      className={`relative w-16 h-16 rounded-sm overflow-hidden border-2 transition-all ${
                        selectedAvatar === img ? 'border-emerald-500 scale-105' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
                      }`}
                    >
                      <img src={img} alt="Avatar" className="w-full h-full object-cover" />
                      {selectedAvatar === img && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-emerald-500 drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button 
                  type="button"
                  className="mt-4 flex items-center gap-2 text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Randomize Options
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-[10px] font-black uppercase bg-red-500/5 p-3 border border-red-500/10 text-center"
              >
                System Error: {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center gap-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-sm transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Identify' : 'Create Identity'}
                </>
              )}
            </button>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
              {isLogin ? "Need a new identity? register" : "Back to identification"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
