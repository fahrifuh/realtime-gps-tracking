const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3001;

// Serve file statis dari folder public
app.use(express.static(path.join(__dirname, "../public")));

// Buat server HTTP (bukan langsung app.listen)
const server = http.createServer(app);

// Buat WebSocket server di atas server HTTP yang sama
const wss = new WebSocket.Server({ server });

// Broadcast data posisi ke semua client yang connect
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    // Broadcast ke semua client, termasuk pengirim
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Jalankan server HTTP + WebSocket
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
