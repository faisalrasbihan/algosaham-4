/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Next 14's build-time lint runner is not compatible with ESLint 9.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
