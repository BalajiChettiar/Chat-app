import { WebSocketServer, WebSocket } from 'ws';

// Extend the built-in WebSocket to allow custom properties
interface ExtendedWebSocket extends WebSocket {
  roomCode?: string;
  userName?: string;
}

// Define the shape of a room’s member
interface RoomMember {
  socket: ExtendedWebSocket;
  name: string;
}

// Record of rooms → list of members
const rooms: Record<string, RoomMember[]> = {};

// Create WebSocket server on port 8080
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (rawSocket) => {
  const socket = rawSocket as ExtendedWebSocket;
  console.log('🛜 New WebSocket client connected.');

  socket.on('message', (message) => {
    let data: any;
    try {
      data = JSON.parse(message.toString());
      console.log('📨 Received:', data);
    } catch (err) {
      console.error('❌ Invalid JSON:', err);
      return;
    }

    switch (data.type) {
      case 'create-room': {
        const code = data.code as string;
        if (!rooms[code]) {
          rooms[code] = [];
          console.log(`✅ Room ${code} created.`);
        } else {
          console.warn(`⚠️ Room ${code} already exists.`);
        }
        break;
      }

      case 'join-room': {
        const { roomCode, name } = data as { roomCode: string; name: string };
        if (rooms[roomCode]) {
          socket.roomCode = roomCode;
          socket.userName = name;

          const alreadyJoined = rooms[roomCode].some(member => member.socket === socket);
          if (!alreadyJoined) {
            rooms[roomCode].push({ socket, name });
            console.log(`👤 ${name} joined room ${roomCode}`);
          } else {
            console.log(`⚠️ ${name} is already in room ${roomCode}`);
          }

          socket.send(JSON.stringify({ type: 'joined', roomCode }));
        } else {
          socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        }
        break;
      }

      case 'message': {
        const { roomCode, text } = data as { roomCode: string; text: string };
        const members = rooms[roomCode];
        if (members) {
          members.forEach((member) => {
            if (member.socket.readyState === WebSocket.OPEN) {
              member.socket.send(
                JSON.stringify({
                  type: 'message',
                  sender: socket.userName,
                  text,
                })
              );
            }
          });
        } else {
          console.warn(`⚠️ Tried to send message to non-existing room ${roomCode}`);
        }
        break;
      }

      default:
        console.warn('⚠️ Unknown message type:', data.type);
    }
  });

  socket.on('close', () => {
    console.log('❌ A user disconnected.');

    const code = socket.roomCode;
    if (code && rooms[code]) {
      rooms[code] = rooms[code].filter((m) => m.socket !== socket);

      if (rooms[code].length === 0) {
        delete rooms[code];
        console.log(`🧹 Room ${code} deleted (empty).`);
      }
    }
  });
});

console.log('🚀 WebSocket server running at ws://localhost:8080');
