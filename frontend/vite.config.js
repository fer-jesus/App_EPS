import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["frontdot.dotmunijalapa.org"],
  },
});

// export default defineConfig({
//   server: {
//     allowedHosts: [
//       'front_dot.dotmunijalapa.org',
//       'localhost'
//     ],
//     host: '0.0.0.0',
//     port: 5173
//   }
// });
