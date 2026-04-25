import { useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { AuthOverlay } from './components/AuthOverlay';
import { HUD } from './components/HUD';
import { ProximityChat } from './components/ProximityChat';
import { PixiApp } from './game/PixiApp';
import { socket } from './network/socket';
import { BackgroundMusic } from './components/BackgroundMusic';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiAppRef = useRef<PixiApp | null>(null);
  const { user, token } = useAppStore();

  useEffect(() => {
    const storedUser = localStorage.getItem('cosmos_user');
    const storedToken = localStorage.getItem('cosmos_token');
    
    if (storedUser && storedToken) {
      try {
        useAppStore.getState().setUser(JSON.parse(storedUser), storedToken);
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

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden text-white">
      {!user && <AuthOverlay />}
      
      {/* Debug text to see if React is even alive */}
      <div className="fixed top-0 left-0 p-2 text-[8px] opacity-20 pointer-events-none z-[60]">VCOSMOS_ALIVE</div>

      <canvas 
        ref={canvasRef} 
        className="block w-full h-full bg-slate-900" 
        style={{ display: user ? 'block' : 'none' }} 
      />
      
      {user && (
        <>
          <HUD />
          <ProximityChat />
          <BackgroundMusic />
        </>
      )}
    </div>
  );
}

export default App;
