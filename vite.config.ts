import { defineConfig, type Plugin } from "vite";

function offlineHtml(): Plugin {
  return {
    name: "offline-single-html",
    enforce: "post",
    generateBundle(_options, bundle) {
      const html = bundle["index.html"];
      if (!html || html.type !== "asset") throw new Error("Missing HTML entry");
      let source = String(html.source).replace(
        /<script\b[^>]*data-file-launcher[^>]*>[\s\S]*?<\/script>/g,
        "",
      );
      const chunks = Object.values(bundle).filter((item) => item.type === "chunk");
      const entry = chunks.find((item) => item.isEntry);
      if (!entry || chunks.length !== 1 || entry.imports.length || entry.dynamicImports.length || entry.exports.length) {
        throw new Error("Offline delivery requires one self-contained script");
      }
      source = source.replace(
        /<script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>/g,
        "",
      );
      source = source.replace(
        /<\/body>/i,
        () => "<script>\n" + entry.code.replace(/<\/script/gi, "<\\/script") + "\n</script>\n</body>",
      );
      const css = Object.values(bundle).filter(
        (item) => item.type === "asset" && item.fileName.endsWith(".css"),
      );
      const styles = css.map((item) => String(item.source)).join("\n");
      source = source.replace(
        /<link\b[^>]*\brel="stylesheet"[^>]*>/g,
        () => "<style>\n" + styles.replace(/<\/style/gi, "<\\/style") + "\n</style>",
      );
      html.source = source;
      for (const item of [...chunks, ...css]) delete bundle[item.fileName];
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [offlineHtml()],
  build: {
    cssCodeSplit: false,
    emptyOutDir: false,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
