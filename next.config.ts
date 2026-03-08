/** @type {import('next').NextConfig} */
const nextConfig = {

  serverExternalPackages: ['@prisma/client'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
      },
      {
        protocol: 'http', 
        hostname: 'googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;