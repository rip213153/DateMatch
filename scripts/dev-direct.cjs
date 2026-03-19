process.env.NODE_ENV = process.env.NODE_ENV || "development";

const { startServer } = require("next/dist/server/lib/start-server");

const port = Number(process.env.PORT || "3000");
const hostname = process.env.HOSTNAME || "0.0.0.0";

startServer({
  dir: process.cwd(),
  port,
  hostname,
  isDev: true,
  allowRetry: true,
}).catch((error) => {
  console.error("Failed to start direct dev server:", error);
  process.exit(1);
});
