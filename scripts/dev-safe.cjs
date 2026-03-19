process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Keep a single PATH key in this process to avoid Windows child-process edge cases.
const pathValue = process.env.Path || process.env.PATH || "";
delete process.env.Path;
delete process.env.PATH;
process.env.Path = pathValue;

const { startServer } = require("next/dist/server/lib/start-server");

const port = Number(process.env.PORT || "3000");

startServer({
  dir: process.cwd(),
  port,
  isDev: true,
  allowRetry: true,
}).catch((error) => {
  console.error("Failed to start safe dev server:", error);
  process.exit(1);
});
