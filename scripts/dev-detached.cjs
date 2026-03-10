const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const portArg = process.argv[2];
const requestedPort = Number(portArg || process.env.PORT || "3013");
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 3013;

const logDir = process.cwd();
const outPath = path.join(logDir, "datematch.detached.out.log");
const errPath = path.join(logDir, "datematch.detached.err.log");

const env = { ...process.env };
const pathValue = env.Path || env.PATH || "";

delete env.Path;
delete env.PATH;
env.Path = pathValue;
env.PORT = String(port);
env.NODE_ENV = env.NODE_ENV || "development";

fs.writeFileSync(outPath, "", "utf8");
fs.writeFileSync(errPath, "", "utf8");

const outFd = fs.openSync(outPath, "a");
const errFd = fs.openSync(errPath, "a");

const child = spawn(process.execPath, [path.join("scripts", "dev-direct.cjs")], {
  cwd: process.cwd(),
  detached: true,
  env,
  stdio: ["ignore", outFd, errFd],
  windowsHide: true,
});

child.unref();

console.log(`Detached dev server requested on http://localhost:${port}`);
console.log(`stdout: ${outPath}`);
console.log(`stderr: ${errPath}`);
