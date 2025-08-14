import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	root: path.resolve(__dirname),
	test: {
		environment: "node",
		testTimeout: 30000,
		globals: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
});


