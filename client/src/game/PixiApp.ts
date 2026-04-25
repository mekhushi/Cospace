import * as PIXI from 'pixi.js';
import { PlayerSprite } from './PlayerSprite';
import { socket } from '../network/socket';
import { useAppStore } from '../store/useAppStore';

export class PixiApp {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private roomsLayer: PIXI.Container;
  private markersLayer: PIXI.Container;
  private playersLayer: PIXI.Container;
  private localPlayer: PlayerSprite | null = null;
  private remotePlayers: Map<string, PlayerSprite> = new Map();
  private keys: Set<string> = new Set();
  private speed = 5;

  private worldWidth = 2000;
  private worldHeight = 1500;
  private zoneBounds: Array<{ name: string; x: number; y: number; w: number; h: number }> = [];
  private particles: PIXI.Graphics[] = [];
  private interactionPoints: Array<{ x: number; y: number; prompt: string; action: string }> = [
    { x: 500, y: 250, prompt: 'Press [E] to use Workstation', action: 'work' },
    { x: 250, y: 800, prompt: 'Press [E] to brew Coffee', action: 'coffee' },
    { x: 1200, y: 1350, prompt: 'Press [E] to sit in Meeting', action: 'sit' },
    { x: 1400, y: 800, prompt: 'Press [E] to check Waiting List', action: 'check' },
  ];

  constructor() {
    this.app = new PIXI.Application();
    this.container = new PIXI.Container();
    this.roomsLayer = new PIXI.Container();
    this.markersLayer = new PIXI.Container();
    this.playersLayer = new PIXI.Container();
  }

  public async init(canvas: HTMLCanvasElement) {
    await this.app.init({
      canvas: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.app.stage.addChild(this.container);
    this.container.addChild(this.roomsLayer);
    this.container.addChild(this.markersLayer);
    this.container.addChild(this.playersLayer);

    // Particles
    const pColors = [0xffffff, 0x00f2ff, 0x7000ff, 0xff00d4];
    for (let i = 0; i < 100; i++) {
      const p = new PIXI.Graphics();
      const size = Math.random() * 3 + 1;
      const color = pColors[Math.floor(Math.random() * pColors.length)];
      p.circle(0, 0, size);
      p.fill({ color: color, alpha: Math.random() * 0.6 + 0.2 });
      p.x = Math.random() * 4000 - 1000;
      p.y = Math.random() * 3000 - 750;
      this.container.addChildAt(p, 0); 
      this.particles.push(p);
    }

    // Interaction Markers
    for (const point of this.interactionPoints) {
      const marker = new PIXI.Graphics();
      marker.setStrokeStyle({ width: 3, color: 0x10b981, alpha: 0.6 });
      marker.circle(0, 0, 45);
      marker.stroke();
      marker.x = point.x;
      marker.y = point.y;
      this.markersLayer.addChild(marker);
    }

    // Load Assets
    try {
      const cityTexture = await PIXI.Assets.load('/city_bg.png');
      const cityBg = new PIXI.TilingSprite(cityTexture);
      cityBg.width = this.worldWidth;
      cityBg.height = this.worldHeight;
      cityBg.alpha = 0.25;
      this.roomsLayer.addChild(cityBg);
    } catch (e) { console.warn('City BG fail'); }

    await this.drawOfficeRooms();

    // Ticker & Listeners
    this.app.ticker.add((ticker) => {
      try {
        this.update(ticker.deltaTime);
      } catch (err) {
        console.error('Pixi Tick Error:', err);
      }
    });

    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('resize', () => this.resize());
  }

  private async drawOfficeRooms() {
    const zones = [
      { id: 'dev', name: 'DEVELOPMENT AREA', x: 400, y: 100, asset: '/dev_area.png' },
      { id: 'kitchen', name: 'KITCHEN', x: 100, y: 700, asset: '/kitchen.png' },
      { id: 'lounge', name: 'LOUNGE', x: 750, y: 700, asset: '/lounge.png' },
      { id: 'waiting', name: 'WAITING AREA', x: 1300, y: 700, asset: '/waiting_area.png' },
      { id: 'team', name: 'TEAM ROOM', x: 1000, y: 1200, asset: '/team_room.png' },
    ];

    for (const zone of zones) {
      try {
        const texture = await PIXI.Assets.load(zone.asset);
        const sprite = new PIXI.Sprite(texture);
        sprite.x = zone.x;
        sprite.y = zone.y;
        this.roomsLayer.addChild(sprite);
        this.zoneBounds.push({ name: zone.name, x: zone.x, y: zone.y, w: sprite.width, h: sprite.height });
      } catch (e) { console.warn('Zone fail:', zone.name); }
    }
  }

  public setupSocketListeners() {
    // Clear existing to avoid dupes
    socket.off('current_players');
    socket.off('player_joined');
    socket.off('players_update');
    socket.off('player_left');
    socket.off('proximity_enter');
    socket.off('proximity_leave');
    socket.off('chat_message');
    socket.off('peer_joined_room');
    socket.off('peer_left_room');

    socket.on('current_players', (players: any[]) => {
      try {
        console.log('Received current_players:', players?.length);
        if (!Array.isArray(players)) return;
        useAppStore.getState().setOnlineCount(players.length);
        players.forEach(p => { 
          if (p && p.id && p.id !== socket.id) {
            console.log('Adding remote player from current_players:', p.username);
            this.addRemotePlayer(p); 
          }
        });
      } catch (err) { console.error('Error in current_players:', err); }
    });

    socket.on('player_joined', (p: any) => {
      try {
        console.log('Player joined:', p?.username);
        if (!p || !p.id || p.id === socket.id) return;
        useAppStore.getState().setOnlineCount(useAppStore.getState().onlineCount + 1);
        this.addRemotePlayer(p);
      } catch (err) { console.error('Error in player_joined:', err); }
    });

    socket.on('players_update', (players: any[]) => {
      try {
        if (!Array.isArray(players)) return;
        players.forEach(p => {
          if (!p || !p.id || p.id === socket.id) return;
          const sprite = this.remotePlayers.get(p.id);
          if (sprite) sprite.updatePosition(p.x, p.y);
        });
      } catch (err) { console.error('Error in players_update:', err); }
    });

    socket.on('player_left', (id: string) => {
      try {
        console.log('Player left:', id);
        const sprite = this.remotePlayers.get(id);
        if (sprite) {
          this.playersLayer.removeChild(sprite);
          this.remotePlayers.delete(id);
          useAppStore.getState().setOnlineCount(Math.max(0, useAppStore.getState().onlineCount - 1));
        }
      } catch (err) { console.error('Error in player_left:', err); }
    });

    socket.on('proximity_enter', (data: any) => {
      try {
        console.log('Proximity Group Enter:', data?.roomId, data?.peers?.length);
        if (data && data.roomId) {
          useAppStore.getState().setActiveRoom(data.roomId);
          if (data.peers) {
            useAppStore.getState().setPeersInRoom(data.peers);
          }
        }
      } catch (err) { console.error('Error in proximity_enter:', err); }
    });

    socket.on('peer_joined_room', (data: any) => {
      try {
        console.log('Peer joined proximity room:', data?.peer?.username);
        if (data && data.peer) {
          useAppStore.getState().addPeerToRoom(data.peer);
        }
      } catch (err) { console.error('Error in peer_joined_room:', err); }
    });

    socket.on('peer_left_room', (data: any) => {
      try {
        console.log('Peer left proximity room:', data?.playerId);
        if (data && data.playerId) {
          useAppStore.getState().removePeerFromRoom(data.playerId);
        }
      } catch (err) { console.error('Error in peer_left_room:', err); }
    });

    socket.on('proximity_leave', () => {
      try {
        console.log('Proximity Leave');
        useAppStore.getState().setActiveRoom(null);
        setTimeout(() => {
          try {
            useAppStore.getState().clearChat();
          } catch (e) {}
        }, 500);
      } catch (err) { console.error('Error in proximity_leave:', err); }
    });

    socket.on('chat_message', (msg: any) => {
      try {
        if (msg) {
          useAppStore.getState().addChatMessage(msg);
          
          // Show speech bubble over head
          if (msg.senderId === socket.id) {
            if (this.localPlayer) this.localPlayer.showSpeechBubble(msg.text);
          } else {
            const remote = this.remotePlayers.get(msg.senderId);
            if (remote) remote.showSpeechBubble(msg.text);
          }
        }
      } catch (err) { console.error('Error in chat_message:', err); }
    });
  }

  private addRemotePlayer(p: any) {
    if (this.remotePlayers.has(p.id)) return;
    const sprite = new PlayerSprite(p.username, p.avatar, p.x, p.y);
    this.playersLayer.addChild(sprite);
    this.remotePlayers.set(p.id, sprite);
  }

  public createLocalPlayer(username: string, avatar: string) {
    const spawnX = 1000;
    const spawnY = 350;
    this.localPlayer = new PlayerSprite(username, avatar, spawnX, spawnY);
    this.localPlayer.setAsLocalPlayer();
    this.playersLayer.addChild(this.localPlayer);
    
    socket.emit('join', {
      userId: Math.floor(Math.random() * 1000),
      username,
      avatar,
      x: this.localPlayer.x,
      y: this.localPlayer.y
    });
  }

  private update(delta: number) {
    if (!this.localPlayer) return;

    // Don't move if typing in any input field
    const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

    let moved = false;
    if (!isTyping) {
      if (this.keys.has('w') || this.keys.has('arrowup')) { this.localPlayer.targetY -= this.speed * delta; moved = true; }
      if (this.keys.has('s') || this.keys.has('arrowdown')) { this.localPlayer.targetY += this.speed * delta; moved = true; }
      if (this.keys.has('a') || this.keys.has('arrowleft')) { this.localPlayer.targetX -= this.speed * delta; moved = true; }
      if (this.keys.has('d') || this.keys.has('arrowright')) { this.localPlayer.targetX += this.speed * delta; moved = true; }
    }

    this.localPlayer.tick(delta);
    this.remotePlayers.forEach(p => p.tick(delta));

    // Particles animate
    this.particles.forEach((p, i) => {
      p.alpha = 0.2 + Math.sin(Date.now() * 0.001 + i) * 0.2;
    });

    this.checkZones();
    this.checkInteractions();

    this.container.x = -this.localPlayer.x + window.innerWidth / 2;
    this.container.y = -this.localPlayer.y + window.innerHeight / 2;

    if (moved) {
      socket.emit('movement', { x: this.localPlayer.targetX, y: this.localPlayer.targetY, direction: 'down', isMoving: true });
    }
  }

  private checkZones() {
    if (!this.localPlayer) return;
    let currentRoom: string | null = null;
    for (const zone of this.zoneBounds) {
      if (this.localPlayer.x >= zone.x && this.localPlayer.x <= zone.x + zone.w &&
          this.localPlayer.y >= zone.y && this.localPlayer.y <= zone.y + zone.h) {
        currentRoom = zone.name;
        break;
      }
    }
    if (useAppStore.getState().currentZoneName !== currentRoom) {
      useAppStore.getState().setCurrentZoneName(currentRoom);
    }
  }

  private checkInteractions() {
    if (!this.localPlayer) return;
    let activePrompt: string | null = null;
    for (const point of this.interactionPoints) {
      const dist = Math.sqrt(Math.pow(this.localPlayer.x - point.x, 2) + Math.pow(this.localPlayer.y - point.y, 2));
      if (dist < 150) { activePrompt = point.prompt; break; }
    }
    if (useAppStore.getState().interactionPrompt !== activePrompt) {
      useAppStore.getState().setInteractionPrompt(activePrompt);
    }
    
    // Handle Interaction key [E]
    if (this.keys.has('e')) {
      console.log('E key pressed, checking interactions...');
      const { interactionPrompt, setInteractionMessage } = useAppStore.getState();
      
      if (interactionPrompt) {
        console.log('Interaction valid:', interactionPrompt);
        const action = interactionPrompt.split('to ')[1] || 'ACTIVATE';
        setInteractionMessage(`SUCCESS: ${action.toUpperCase()}`);
        setTimeout(() => setInteractionMessage(null), 3000);
      } else {
        console.warn('E pressed but no interaction prompt active');
      }
      this.keys.delete('e'); 
    }
  }

  private resize() { this.app.renderer.resize(window.innerWidth, window.innerHeight); }
  public destroy() {
    try {
      this.app.destroy();
    } catch (e) {
      console.warn('Destroy error:', e);
    }
  }
}
