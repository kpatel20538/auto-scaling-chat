const Koa = require("koa");
const Router = require('@koa/router');
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = "Hello World";
})

router.post('/', async (ctx) => {  
  ctx.body = `s-echo: ${JSON.stringify(ctx.request.body)}`
});

app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(8080);
