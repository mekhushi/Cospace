import { useEffect, useRef, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { AuthOverlay } from './components/AuthOverlay';
import { HUD } from './components/HUD';
import { ProximityChat } from './components/ProximityChat';
import { LandingPage } from './components/LandingPage';
import { PixiApp } from './game/PixiApp';
import { socket } from './network/socket';
import { BackgroundMusic } from './components/BackgroundMusic';
import { AnimatePresence } from 'framer-motion';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiAppRef = useRef<PixiApp | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const { user, token } = useAppStore();

  useEffect(() => {
    const storedUser = localStorage.getItem('cosmos_user');
    const storedToken = localStorage.getItem('cosmos_token');
    
    if (storedUser && storedToken) {
      try {
        useAppStore.getState().setUser(JSON.parse(storedUser), storedToken);
        setShowLanding(false);
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  useEffect(() => {
    if (!user || !token || !canvasRef.current || pixiAppRef.current) return;

    const instance = new PixiApp();
    pixiAppRef.current = instance;
    
    instance.setupSocketListeners();
    
    const start = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      try {
        await instance.init(canvas);
        if (pixiAppRef.current === instance) {
          socket.connect();
          instance.createLocalPlayer(user.username, user.avatar);
        }
      } catch (err) {
        console.error('Game Init Error:', err);
      }
    };

    start();

    return () => {
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy();
        pixiAppRef.current = null;
      }
      socket.disconnect();
    };
  }, [user, token]);

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden text-white">
      {!user && <AuthOverlay onBack={() => setShowLanding(true)} />}
      
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full bg-slate-900" 
        style={{ display: user ? 'block' : 'none' }} 
      />
      
      {user && (
        <>
          <HUD />
          <AnimatePresence>
            <ProximityChat />
          </AnimatePresence>
          <BackgroundMusic />
        </>
      )}
    </div>
  );
}

export default App;
