import { defineNitroConfig } from "nitropack/config";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, "../../.env") });

export default defineNitroConfig({
  compatibilityDate: '2026-05-14',
  baseURL: '/api/v1',
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    }
  },
  devServer: {}
});