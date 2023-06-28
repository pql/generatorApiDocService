import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteProxy } from "./scripts/service/apifox/node-request.mjs";

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    base: "/",
    plugins: [vue()],
    server: {
      port: 7778,
      host: "0.0.0.0",
      open: env.NODE_ENV === "development",
      proxy: {
        [env.VITE_APP_API_PREFIX]: {
          target: env.VITE_APP_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          configure: viteProxy,
        },
      },
    },
  });
};
