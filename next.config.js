/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google OAuth profile images
      "avatars.githubusercontent.com", // GitHub OAuth profile images
      "res.cloudinary.com", // Cloudinary images (if using)
    ],
  },
};

module.exports = nextConfig;
