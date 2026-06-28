import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@assets":     fileURLToPath(new URL("./src/assets",     import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@config":     fileURLToPath(new URL("./src/config",     import.meta.url)),
      "@context":    fileURLToPath(new URL("./src/context",    import.meta.url)),
      "@hooks":      fileURLToPath(new URL("./src/hooks",      import.meta.url)),
      "@mocks":      fileURLToPath(new URL("./src/mocks",      import.meta.url)),
      "@pages":      fileURLToPath(new URL("./src/pages",      import.meta.url)),
      "@api":        fileURLToPath(new URL("./src/api",        import.meta.url)),
      "@services":   fileURLToPath(new URL("./src/services",   import.meta.url)),
      "@domain":     fileURLToPath(new URL("./src/types",      import.meta.url)),
    },
  },
});
