const { Server: WebSocketServer } = require("ws");
const redis = require("async-redis");
const hash = require("string-hash");
const Graph = require("./graph");

const { HOSTNAME } = process.env;
const CLIENT_COUNT = 3;
const clientsToChannels = new Graph();
const channelToSocket = new Graph();
const clients = new Map();

const ensureRedis = (hashKey) => {
  if (!clients.has(hashKey)) {
    const client = redis.createClient({
      host: `pubsub-stateful-set-${hashKey}.pubsub-service.kpatel20538.svc.cluster.local`,
      port: 6379,
    });
    client.on("message", (channel, message) => {
      console.log(`${HOSTNAME}: Faning out ${message} from ${channel}`);
      console.log(channelToSocket.edges);
      console.log(channelToSocket.edges.get(channel));
      console.log("---");
      for (const socket of channelToSocket.getValues(channel)) {
        console.log(
          `${HOSTNAME}: Faning out ${message} from ${channel} to ${socket}`
        );
        socket.send(message);
      }
    });
    clients.set(hashKey, client);
  }
  return clients.get(hashKey);
};

const wss = new WebSocketServer({
  path: "/ws/",
  port: 8080,
});

wss.on("connection", (ws) => {
  console.log(`${HOSTNAME}: Connection ${ws}`);

  ws.on("message", (channel) => {
    console.log(`${HOSTNAME}: Message ${channel} ${ws}`);
    channelToSocket.add(channel, ws);
    console.log(channelToSocket.edges);
    console.log(channelToSocket.edges.get(channel));
    console.log("---");
  });

  ws.on("close", () => {
    console.log(`${HOSTNAME}: Close ${ws}`);
    channelToSocket.deleteValue(ws);
  });

  ws.on("error", (error) => {
    console.error(error);
  });
});

wss.on("error", (error) => {
  console.error(error);
});

wss.on("close", () => {
  console.log(`${HOSTNAME}: WebSocketServer closed`);
  channelToSocket.clear();
});

channelToSocket.on("sourceAdded", async (channel) => {
  try {
    console.log(`${HOSTNAME}: Subscibing to ${channel}`);
    const hashKey = hash(channel) % CLIENT_COUNT;
    const client = ensureRedis(hashKey);
    const response = await client.subscribe(channel);
    clientsToChannels.add(hashKey, channel);
    console.log(
      `${HOSTNAME}: Subscibing Response from pubsub-stateful-set-${hashKey}: ${response}`
    );
  } catch (error) {
    console.error(error);
  }
});

channelToSocket.on("sourceDeleted", async (channel) => {
  try {
    console.log(`${HOSTNAME}:Unsubscibing from ${channel}`);
    const hashKey = hash(channel) % CLIENT_COUNT;
    const client = clients.get(hashKey);
    const response = await client.unsubscribe(channel);
    clientsToChannels.deleteValue(channel);
    console.log(
      `${HOSTNAME}: Unsubscibing Response from pubsub-stateful-set-${hashKey}: ${response}`
    );
  } catch (error) {
    console.error(error);
  }
});

clientsToChannels.on("sourceAdded", (hashKey) => {
  console.log(`${HOSTNAME}: Connecting to pubsub-stateful-set-${hashKey}`);
});

clientsToChannels.on("sourceDeleted", async (hashKey) => {
  try {
    console.log(
      `${HOSTNAME}: Disconnecting from pubsub-stateful-set-${hashKey}`
    );
    await clients.get(hashKey).quit();
    clients.delete(hashKey);
  } catch (error) {
    console.error(error);
  }
});

console.log(`${HOSTNAME}: Started`);
