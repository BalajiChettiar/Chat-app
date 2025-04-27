"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
// Record of rooms → list of members
const rooms = {};
// Create WebSocket server on port 8080
const wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on('connection', (rawSocket) => {
    const socket = rawSocket;
    console.log('🛜 New WebSocket client connected.');
    socket.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
            console.log('📨 Received:', data);
        }
        catch (err) {
            console.error('❌ Invalid JSON:', err);
            return;
        }
        switch (data.type) {
            case 'create-room': {
                const code = data.code;
                if (!rooms[code]) {
                    rooms[code] = [];
                    console.log(`✅ Room ${code} created.`);
                }
                else {
                    console.warn(`⚠️ Room ${code} already exists.`);
                }
                break;
            }
            case 'join-room': {
                const { roomCode, name } = data;
                if (rooms[roomCode]) {
                    socket.roomCode = roomCode;
                    socket.userName = name;
                    const alreadyJoined = rooms[roomCode].some(member => member.socket === socket);
                    if (!alreadyJoined) {
                        rooms[roomCode].push({ socket, name });
                        console.log(`👤 ${name} joined room ${roomCode}`);
                    }
                    else {
                        console.log(`⚠️ ${name} is already in room ${roomCode}`);
                    }
                    socket.send(JSON.stringify({ type: 'joined', roomCode }));
                }
                else {
                    socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
                }
                break;
            }
            case 'message': {
                const { roomCode, text } = data;
                const members = rooms[roomCode];
                if (members) {
                    members.forEach((member) => {
                        if (member.socket.readyState === ws_1.WebSocket.OPEN) {
                            member.socket.send(JSON.stringify({
                                type: 'message',
                                sender: socket.userName,
                                text,
                            }));
                        }
                    });
                }
                else {
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
