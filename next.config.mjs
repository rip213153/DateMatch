/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    instrumentationHook: true,
    webpackBuildWorker: false,
    workerThreads: false,
  },
};

export default nextConfig;
