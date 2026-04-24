import { Server, Socket } from 'socket.io';
import { Player } from './PlayerManager';

const PROXIMITY_RADIUS = 250; // pixels

export class ProximityEngine {
  private io: Server;
  private players: Map<string, Player>;
  private activeRooms: Map<string, Set<string>> = new Map(); // RoomId -> Set of Player IDs

  constructor(io: Server, players: Map<string, Player>) {
    this.io = io;
    this.players = players;
  }

  public update() {
    const playerArr = Array.from(this.players.values());
    
    // Naive O(N^2) for now. Can be optimized with Spatial Hash Grid for many players.
    const connections = new Set<string>();

    for (let i = 0; i < playerArr.length; i++) {
      for (let j = i + 1; j < playerArr.length; j++) {
        const p1 = playerArr[i];
        const p2 = playerArr[j];

        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        if (dist <= PROXIMITY_RADIUS) {
          // Check line of sight (mock implementation, you can add wall arrays here)
          const hasLineOfSight = true; // TODO: integrate collision map check

          if (hasLineOfSight) {
            connections.add(`${p1.id}-${p2.id}`);
            this.handleProximityMatch(p1.id, p2.id);
          }
        }
      }
    }

    // Cleanup old rooms
    for (const [roomId, members] of this.activeRooms.entries()) {
      const p1 = Array.from(members)[0];
      const p2 = Array.from(members)[1];
      
      if (!p1 || !p2 || !this.players.has(p1) || !this.players.has(p2)) {
        this.destroyRoom(roomId);
        continue;
      }

      if (!connections.has(`${p1}-${p2}`) && !connections.has(`${p2}-${p1}`)) {
        this.destroyRoom(roomId);
      }
    }
  }

  private handleProximityMatch(id1: string, id2: string) {
    const p1 = this.players.get(id1);
    const p2 = this.players.get(id2);
    if (!p1 || !p2) return;

    // Check if they are already in a room together
    for (const [roomId, members] of this.activeRooms.entries()) {
      if (members.has(id1) && members.has(id2)) {
        return; // Already connected
      }
    }

    // Create a new room
    const roomId = `room-${Math.random().toString(36).substr(2, 9)}`;
    const members = new Set([id1, id2]);
    this.activeRooms.set(roomId, members);

    // Notify players to open chat panel
    const socket1 = this.io.sockets.sockets.get(id1);
    const socket2 = this.io.sockets.sockets.get(id2);

    if (socket1 && socket2) {
      socket1.join(roomId);
      socket2.join(roomId);
      
      socket1.emit('proximity_enter', { roomId, peer: p2 });
      socket2.emit('proximity_enter', { roomId, peer: p1 });
    }
  }

  private destroyRoom(roomId: string) {
    const members = this.activeRooms.get(roomId);
    if (!members) return;

    members.forEach(id => {
      const socket = this.io.sockets.sockets.get(id);
      if (socket) {
        socket.leave(roomId);
        socket.emit('proximity_leave', { roomId });
      }
    });

    this.activeRooms.delete(roomId);
  }

  public removePlayer(playerId: string) {
    for (const [roomId, members] of this.activeRooms.entries()) {
      if (members.has(playerId)) {
        this.destroyRoom(roomId);
      }
    }
  }
}
