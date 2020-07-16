const Koa = require("koa");
const Router = require("@koa/router");
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const redis = require("async-redis");
const hash = require("string-hash");

const { HOSTNAME } = process.env;
const app = new Koa();
const router = new Router();

router.post("/", async (ctx) => {
  const { channel } = ctx.request.body;
  const message = JSON.stringify(ctx.request.body);
  const hashKey = hash(channel) % 3;
  console.log(
    `${HOSTNAME}: Publishing to pubsub-stateful-set-${hashKey}: ${message}`
  );

  const client = redis.createClient({
    host: `pubsub-stateful-set-${hashKey}.pubsub-service.kpatel20538.svc.cluster.local`,
    port: 6379,
  });

  const response = await client.publish(channel, message);
  
  console.log(
    `${HOSTNAME}: Response from pubsub-stateful-set-${hashKey}: ${response}`
  );

  ctx.body = response.toString();
});

app.use(cors({ origin: "*" }));
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(8080);
