import React from "react";
import { render } from "react-dom";

render(<h1>Hello World</h1>, document.getElementById("root"));

export const ws = new WebSocket(
  "wss://fanout-ingress-kpatel20538.cloud.okteto.net/ws/"
);

ws.addEventListener('message', (event) => {
  console.log(`c-echo: ${event.data}`);
})

ws.addEventListener("open", () => ws.send("open"));
