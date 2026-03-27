/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
    workerThreads: false,
  },
};

export default nextConfig;
