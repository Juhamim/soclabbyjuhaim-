import express from 'express';
import http from 'http';
import cors from 'cors';
import apiRouter from './routes/api.js';
import { initWebSocketServer } from './websocket/wsServer.js';
import { initSchema } from './config/database.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Enable CORS & Body Parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize DB schema
initSchema();

// Mount API router
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', platform: 'SOCLab AI', mode: 'Offline Local Edition', timestamp: new Date().toISOString() });
});

// Initialize WebSockets
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  SOCLab AI Core Backend running on port ${PORT}`);
  console.log(`  REST API: http://localhost:${PORT}/api`);
  console.log(`  WebSocket Gateway: ws://localhost:${PORT}`);
  console.log(`====================================================`);
});
