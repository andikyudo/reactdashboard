import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		proxy: {
			"/api/unwiredlabs": {
				target: "https://us1.unwiredlabs.com/v2",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/unwiredlabs/, ""),
			},
		},
	},
});
