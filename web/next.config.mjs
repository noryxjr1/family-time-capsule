import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": path.join(__dirname, "shims/async-storage.js"),
      "pino-pretty": path.join(__dirname, "shims/pino-pretty.js"),
    };
    return config;
  },
};

export default nextConfig;
