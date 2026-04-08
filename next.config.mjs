import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

export default function nextConfig(phase) {
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    experimental: {
      cpus: 1,
      instrumentationHook: true,
      webpackBuildWorker: false,
      workerThreads: false,
    },
  };
}
