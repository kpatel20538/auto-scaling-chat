const { Server: WebSocketServer } = require("ws");

const wss = new WebSocketServer({
  path: "/ws/",
  port: 8080,
});

wss.on("connection", function (ws) {
  ws.send(`ws connection`);
  ws.on("message", (data) => {
    ws.send(`echo: ${data}`);
  });
});

wss.on("close", function close() {
  console.log("ws disconnected");
});
