import { useEffect, useRef, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { AuthOverlay } from './components/AuthOverlay';
import { HUD } from './components/HUD';
import { ProximityChat } from './components/ProximityChat';
import { LandingPage } from './components/LandingPage';
import { PixiApp } from './game/PixiApp';
import { socket } from './network/socket';
import { BackgroundMusic } from './components/BackgroundMusic';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiAppRef = useRef<PixiApp | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const { user, token } = useAppStore();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('cosmos_user');
    const storedToken = localStorage.getItem('cosmos_token');
    
    if (storedUser && storedToken) {
      useAppStore.getState().setUser(JSON.parse(storedUser), storedToken);
      setShowLanding(false);
    }
  }, []);

  useEffect(() => {
    if (user && token && canvasRef.current && !pixiAppRef.current) {
      socket.connect();
      
      pixiAppRef.current = new PixiApp(canvasRef.current);
      pixiAppRef.current.createLocalPlayer(user.username, user.avatar);
    }

    return () => {
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy();
        pixiAppRef.current = null;
        socket.disconnect();
      }
    };
  }, [user, token]);

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {!user && <AuthOverlay />}
      
      <canvas ref={canvasRef} className="block w-full h-full" />
      
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
