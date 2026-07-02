/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows Next.js to serve client-side resources to devices on your local network
  allowedDevOrigins: [
    '192.168.1.105',
    'localhost',
  ],
};

export default nextConfig;
