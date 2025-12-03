/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/robots.txt",
        destination: "/api/robots",
      },
      {
        source: "/backend/api/cloudinary/:path*",
        destination: `${process.env.NEXT_PUBLIC_CLOUDINARY_HOST_URL}/api/cloudinary/:path*`,
      },
      {
        source: "/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_HOST_URL}/:path*`,
      },
    ];
  },
};
export default nextConfig;
