const WebSocket = require('ws');
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',   // Allow your React frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],  // 💥 allow Content-Type header
  }));
const ws = new WebSocket('ws://localhost:8080');
app.use(express.json()); // To parse JSON bodies

// In-memory store
const generatedCodes = new Set();  // stores generated codes
const existingRooms = new Set();   // stores active rooms

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Function to generate unique 6-char alphanumeric code
function generateUniqueCode() {
  if (generatedCodes.size >= Math.pow(characters.length, 6)) {
    throw new Error('All possible codes used!');
  }

  let code;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (generatedCodes.has(code));

  generatedCodes.add(code);
  return code;
}

// Route: Generate Room Code

  app.get('/generate-code', (req, res) => {
    try {
      const code = generateUniqueCode();
      existingRooms.add(code);
  
      // 1) If the WS connection is already open, send immediately
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type:"create-room", code }));
      } else {
        // 2) Otherwise, wait for it to open and then send
        ws.once('open', () => {
          ws.send(JSON.stringify({ type: 'create-room', code }));
        });
      }
  
      // 3) Finally respond to your HTTP client
      res.json({ code });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  


// Route: Join Room
app.post('/join-room', (req, res) => {
  const { name, roomCode } = req.body;

  if (!name || !roomCode) {
    return res.status(400).json({ success: false, message: 'Name and Room Code are required' });
  }

  if (!existingRooms.has(roomCode)) {
    return res.status(404).json({ success: false, message: 'Invalid Room Code' });
  }

  console.log(`${name} is joining room: ${roomCode}`);
  return res.status(200).json({ success: true, message: 'Room found, you can join!' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
