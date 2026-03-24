/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the standalone Docker production build
  output: "standalone",
};

module.exports = nextConfig;
