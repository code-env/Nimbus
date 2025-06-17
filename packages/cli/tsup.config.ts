import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	clean: true,
	dts: {
		compilerOptions: {
			incremental: false,
		},
	},
	shims: true,
	banner: {
		js: '\n"use strict";',
	},
});
