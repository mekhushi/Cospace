import { Server, Socket } from 'socket.io';
import { Player } from './PlayerManager';

const PROXIMITY_RADIUS = 250; // pixels

export class ProximityEngine {
  private io: Server;
  private players: Map<string, any>;
  private activeRooms: Map<string, Set<string>> = new Map(); // RoomId -> Set of PlayerIds
  private playerToRoom: Map<string, string> = new Map(); // PlayerId -> RoomId

  constructor(io: Server, players: Map<string, any>) {
    this.io = io;
    this.players = players;
  }

  public update() {
    try {
      const playerArr = Array.from(this.players.values());
      const clusters: Set<string>[] = [];
      const visited = new Set<string>();

      // Simple clustering algorithm to find groups of players within proximity
      for (const p of playerArr) {
        if (visited.has(p.id)) continue;
        
        const cluster = new Set<string>();
        const queue = [p.id];
        visited.add(p.id);

        while (queue.length > 0) {
          const currentId = queue.shift()!;
          cluster.add(currentId);
          const currentP = this.players.get(currentId);
          if (!currentP) continue;

          for (const otherP of playerArr) {
            if (visited.has(otherP.id)) continue;
            const dist = Math.hypot(otherP.x - currentP.x, otherP.y - currentP.y);
            if (dist <= PROXIMITY_RADIUS) {
              visited.add(otherP.id);
              queue.push(otherP.id);
            }
          }
        }

        if (cluster.size >= 2) {
          clusters.push(cluster);
        }
      }

      // Update rooms based on clusters
      this.syncRooms(clusters);
      
    } catch (err) {
      console.error('ProximityEngine Update Error:', err);
    }
  }

  private syncRooms(newClusters: Set<string>[]) {
    // 1. Identify which players need to leave their current rooms
    const currentRoomPlayers = new Set(this.playerToRoom.keys());
    const newClusterPlayers = new Set<string>();
    newClusters.forEach(c => c.forEach(id => newClusterPlayers.add(id)));

    // Players who were in a room but are no longer in any cluster
    for (const pid of currentRoomPlayers) {
      if (!newClusterPlayers.has(pid)) {
        this.leaveCurrentRoom(pid);
      }
    }

    // 2. Map clusters to existing rooms or create new ones
    for (const cluster of newClusters) {
      // Find if any player in this cluster is already in a room
      let existingRoomId: string | null = null;
      for (const pid of cluster) {
        if (this.playerToRoom.has(pid)) {
          existingRoomId = this.playerToRoom.get(pid)!;
          break;
        }
      }

      if (existingRoomId) {
        // Update existing room
        const roomMembers = this.activeRooms.get(existingRoomId)!;
        
        // Add new members
        for (const pid of cluster) {
          if (!roomMembers.has(pid)) {
            this.joinRoom(pid, existingRoomId);
          }
        }
        
        // Remove members who left this cluster but were in this room
        for (const pid of roomMembers) {
          if (!cluster.has(pid)) {
            this.leaveCurrentRoom(pid);
          }
        }
      } else {
        // Create new room
        const roomId = `group-${Math.random().toString(36).substring(2, 11)}`;
        this.activeRooms.set(roomId, new Set());
        for (const pid of cluster) {
          this.joinRoom(pid, roomId);
        }
      }
    }
  }

  private joinRoom(playerId: string, roomId: string) {
    const roomMembers = this.activeRooms.get(roomId);
    const player = this.players.get(playerId);
    const socket = this.io.sockets.sockets.get(playerId);
    
    if (roomMembers && player && socket) {
      roomMembers.add(playerId);
      this.playerToRoom.set(playerId, roomId);
      socket.join(roomId);

      // Tell the player they entered proximity
      // In group mode, we might want to send the whole list of peers
      const peers = Array.from(roomMembers)
        .filter(id => id !== playerId)
        .map(id => this.players.get(id))
        .filter(p => p !== undefined);

      socket.emit('proximity_enter', { roomId, peers });
      
      // Tell others in the room that a new peer joined
      socket.to(roomId).emit('peer_joined_room', { peer: player });
      console.log(`[PROXIMITY] ${player.username} joined room ${roomId}`);
    }
  }

  private leaveCurrentRoom(playerId: string) {
    const roomId = this.playerToRoom.get(playerId);
    if (!roomId) return;

    const roomMembers = this.activeRooms.get(roomId);
    const socket = this.io.sockets.sockets.get(playerId);

    if (roomMembers) {
      roomMembers.delete(playerId);
      if (socket) {
        socket.leave(roomId);
        socket.emit('proximity_leave');
        socket.to(roomId).emit('peer_left_room', { playerId });
      }
    }

    this.playerToRoom.delete(playerId);

    // If room is empty or only 1 person, destroy it
    if (!roomMembers || roomMembers.size < 2) {
      if (roomMembers && roomMembers.size === 1) {
        const lastPlayerId = Array.from(roomMembers)[0];
        this.leaveCurrentRoom(lastPlayerId);
      }
      this.activeRooms.delete(roomId);
    }
  }

  public removePlayer(playerId: string) {
    this.leaveCurrentRoom(playerId);
  }
}
