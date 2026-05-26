import { WebSocketServer } from 'ws';

const PORT = process.env.SIGNAL_PORT ? Number(process.env.SIGNAL_PORT) : 8787;
const ROOM_TTL_MS = 10 * 60 * 1000;
const DEFAULT_DURATION_SECONDS = 60;

const prompts = [
  'Draw a house',
  'Draw a robot',
  'Draw a dragon',
  'Draw your dream room',
  'Draw a flying car',
];

const wss = new WebSocketServer({ port: PORT });
const rooms = new Map();
const sockets = new Map();

const randomPrompt = () => prompts[Math.floor(Math.random() * prompts.length)];
const randomRoomId = () => Math.random().toString(36).slice(2, 6).toUpperCase();

function send(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(room, message) {
  room.players.forEach((player) => {
    const ws = sockets.get(player.socketId);
    if (ws) send(ws, message);
  });
}

function publicRoom(room) {
  return {
    roomId: room.roomId,
    status: room.status,
    prompt: room.prompt,
    durationSeconds: room.durationSeconds,
    startAt: room.startAt,
    players: room.players.map((player) => ({
      id: player.id,
      submitted: player.submitted,
      connected: Boolean(sockets.get(player.socketId)),
    })),
  };
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  if (room.expireTimeout) clearTimeout(room.expireTimeout);
  if (room.revealTimeout) clearTimeout(room.revealTimeout);
  rooms.delete(roomId);
}

function scheduleRoomExpiry(room) {
  room.expireTimeout = setTimeout(() => {
    broadcast(room, { type: 'room-expired', roomId: room.roomId });
    cleanupRoom(room.roomId);
  }, ROOM_TTL_MS);
}

function startGame(room) {
  room.status = 'active';
  room.startAt = Date.now();

  broadcast(room, {
    type: 'game-started',
    room: publicRoom(room),
  });

  if (typeof room.durationSeconds === 'number') {
    const revealIn = room.durationSeconds * 1000;
    room.revealTimeout = setTimeout(() => {
      room.status = 'revealed';
      broadcast(room, { type: 'force-reveal', reason: 'timer-ended' });
      setTimeout(() => cleanupRoom(room.roomId), 15 * 1000);
    }, revealIn);
  }
}

function handleSubmitted(room, playerId) {
  const player = room.players.find((p) => p.id === playerId);
  if (!player || player.submitted) return;

  player.submitted = true;
  broadcast(room, {
    type: 'room-updated',
    room: publicRoom(room),
  });

  if (room.players.every((p) => p.submitted)) {
    room.status = 'revealed';
    if (room.revealTimeout) clearTimeout(room.revealTimeout);
    broadcast(room, { type: 'force-reveal', reason: 'both-submitted' });
    setTimeout(() => cleanupRoom(room.roomId), 15 * 1000);
  }
}

wss.on('connection', (ws) => {
  const socketId = crypto.randomUUID();
  sockets.set(socketId, ws);

  ws.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: 'error', error: 'Invalid JSON message' });
      return;
    }

    if (message.type === 'create-room') {
      let roomId = randomRoomId();
      while (rooms.has(roomId)) roomId = randomRoomId();

      const room = {
        roomId,
        status: 'waiting',
        prompt: randomPrompt(),
        durationSeconds: DEFAULT_DURATION_SECONDS,
        startAt: null,
        players: [{ id: 'host', socketId, submitted: false }],
        createdAt: Date.now(),
      };
      rooms.set(roomId, room);
      scheduleRoomExpiry(room);

      send(ws, {
        type: 'room-created',
        playerId: 'host',
        room: publicRoom(room),
      });
      return;
    }

    if (message.type === 'join-room') {
      const room = rooms.get(message.roomId);
      if (!room) {
        send(ws, { type: 'error', error: 'Room not found' });
        return;
      }
      if (room.players.length >= 2) {
        send(ws, { type: 'error', error: 'Room is full' });
        return;
      }
      if (room.status !== 'waiting') {
        send(ws, { type: 'error', error: 'Game already started' });
        return;
      }

      room.players.push({ id: 'guest', socketId, submitted: false });
      send(ws, {
        type: 'room-joined',
        playerId: 'guest',
        room: publicRoom(room),
      });
      broadcast(room, {
        type: 'room-updated',
        room: publicRoom(room),
      });
      return;
    }

    if (message.type === 'start-game') {
      const room = rooms.get(message.roomId);
      if (!room) return;
      if (room.status !== 'waiting') return;
      if (room.players.length !== 2) return;

      const host = room.players.find((p) => p.id === 'host');
      if (!host || host.socketId !== socketId) {
        send(ws, { type: 'error', error: 'Only host can start the game' });
        return;
      }

      if (message.durationSeconds === null) {
        room.durationSeconds = null;
      } else if (typeof message.durationSeconds === 'number') {
        room.durationSeconds = Math.max(5, Math.min(600, message.durationSeconds));
      }
      startGame(room);
      return;
    }

    if (message.type === 'signal') {
      const room = rooms.get(message.roomId);
      if (!room) return;
      const target = room.players.find((p) => p.id === message.to);
      if (!target) return;
      const targetWs = sockets.get(target.socketId);
      if (!targetWs) return;
      send(targetWs, {
        type: 'signal',
        from: message.from,
        signal: message.signal,
      });
      return;
    }

    if (message.type === 'submitted') {
      const room = rooms.get(message.roomId);
      if (!room) return;
      handleSubmitted(room, message.playerId);
      return;
    }
  });

  ws.on('close', () => {
    sockets.delete(socketId);

    for (const [roomId, room] of rooms.entries()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (!player) continue;

      broadcast(room, { type: 'peer-disconnected', playerId: player.id });
      cleanupRoom(roomId);
      break;
    }
  });
});

console.log(`Signaling server listening on ws://localhost:${PORT}`);
