const WebSocket = require("ws");
const http = require("http");
const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("Client Connected");

  socket.on("message", (msg) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  socket.on("close", () => {
    console.log("Client Disconnected");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Websocket server running on port ${PORT}`)
})
