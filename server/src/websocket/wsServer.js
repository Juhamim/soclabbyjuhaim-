import { WebSocketServer } from 'ws';

let wss = null;

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'SYSTEM_INFO', message: 'Connected to SOCLab AI Real-time Gateway' }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
      } catch (err) {
        console.error('WS Error:', err.message);
      }
    });
  });

  console.log('WebSocket Gateway initialized');
}

export function broadcast(data) {
  if (!wss) return;
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}

export function broadcastLog(log) {
  broadcast({ type: 'NEW_LOG', log });
}

export function broadcastAlert(alert) {
  broadcast({ type: 'NEW_ALERT', alert });
}

export function broadcastTelemetry(telemetry) {
  broadcast({ type: 'SYSTEM_TELEMETRY', telemetry });
}
