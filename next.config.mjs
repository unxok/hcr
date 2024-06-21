/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jhnyhxjaidpwzjlufyib.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/profile-pictures/**",
      },
    ],
  },
};

export default nextConfig;
