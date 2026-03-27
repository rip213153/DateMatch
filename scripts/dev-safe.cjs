process.env.NODE_ENV = process.env.NODE_ENV || "development";

const { spawn } = require("child_process");

const pathValue = process.env.Path || process.env.PATH || "";
delete process.env.Path;
delete process.env.PATH;
process.env.Path = pathValue;

const nextBin = require.resolve("next/dist/bin/next");
const port = String(process.env.PORT || "3000");

const child = spawn(process.execPath, [nextBin, "dev", "-p", port], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
  windowsHide: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("Failed to start safe dev server:", error);
  process.exit(1);
});
