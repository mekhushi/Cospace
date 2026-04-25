import { Server, Socket } from 'socket.io';
import { ProximityEngine } from './ProximityEngine';

export interface Player {
  id: string; // Socket ID
  userId: number; // DB User ID
  username: string;
  avatar: string;
  x: number;
  y: number;
  direction: string;
  isMoving: boolean;
}

export class PlayerManager {
  private players: Map<string, Player> = new Map();
  private io: Server;
  private proximityEngine: ProximityEngine;
  private tickRate = 1000 / 30; // 30 updates per second
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
    this.proximityEngine = new ProximityEngine(io, this.players);
  }

  public start() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('join', (data: { userId: number, username: string, avatar: string, x: number, y: number }) => {
        const newPlayer: Player = {
          id: socket.id,
          userId: data.userId,
          username: data.username,
          avatar: data.avatar,
          x: data.x || 800,
          y: data.y || 500,
          direction: 'down',
          isMoving: false
        };

        this.players.set(socket.id, newPlayer);
        
        // Send existing players to the new player
        socket.emit('current_players', Array.from(this.players.values()));

        // Broadcast new player to others
        socket.broadcast.emit('player_joined', newPlayer);
      });

      socket.on('movement', (data: { x: number, y: number, direction: string, isMoving: boolean }) => {
        const player = this.players.get(socket.id);
        if (player) {
          player.x = data.x;
          player.y = data.y;
          player.direction = data.direction;
          player.isMoving = data.isMoving;
        }
      });

      socket.on('chat_message', (data: { text: string, roomId: string }) => {
        const player = this.players.get(socket.id);
        if (player && data.roomId) {
          this.io.to(data.roomId).emit('chat_message', {
            id: Date.now().toString(),
            senderId: socket.id,
            senderName: player.username,
            senderAvatar: player.avatar,
            text: data.text,
            timestamp: new Date().toISOString()
          });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        this.players.delete(socket.id);
        this.proximityEngine.removePlayer(socket.id);
        this.io.emit('player_left', socket.id);
      });
    });

    // Start tick loop
    this.updateInterval = setInterval(() => {
      this.tick();
    }, this.tickRate);
  }

  private tick() {
    // Broadcast all player positions
    if (this.players.size > 0) {
      this.io.emit('players_update', Array.from(this.players.values()));
      
      // Calculate proximity logic
      this.proximityEngine.update();
    }
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
