
import { defineConfig, ConfigEnv, UserConfig, ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Custom LinkUp configuration
    mode === 'development' && {
      name: 'linkup-dev-config',
      configResolved(config: ResolvedConfig) {
        console.log('LinkUp dev configuration applied');
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
