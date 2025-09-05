import { defineNuxtModule, createResolver, addPlugin, addComponent, addImports, addServerHandler } from '@nuxt/kit';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const module = defineNuxtModule({
  meta: {
    name: "@lenne.tech/bug.lt",
    configKey: "bug",
    compatibility: {
      nuxt: ">=4.0.0"
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {
    enabled: true,
    autoShow: true,
    position: "bottom-right",
    buttonColor: "#ef4444",
    enableScreenshot: true,
    enableBrowserInfo: true,
    enableConsoleLogs: true,
    theme: "auto",
    maxConsoleLogs: 50
  },
  setup(options, nuxt) {
    if (options.enabled === false) {
      console.info("[@lenne.tech/bug.lt] Module is disabled - skipping initialization");
      return;
    }
    const resolver = createResolver(import.meta.url);
    if (nuxt.options.srcDir) {
      const publicDir = join(nuxt.options.srcDir, "public", "assets");
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
      }
    }
    if (options.enabled !== false) {
      nuxt.options.runtimeConfig.public.bugLt = {
        ...options,
        // Don't expose sensitive data to client
        linearApiKey: void 0
      };
      nuxt.options.runtimeConfig.bugLt = {
        linearApiKey: options.linearApiKey,
        linearTeamName: options.linearTeamName,
        linearProjectName: options.linearProjectName
      };
      addPlugin(resolver.resolve("./runtime/plugin.client"));
      addComponent({
        name: "BugReportButton",
        filePath: resolver.resolve("./runtime/components/BugReportButton.vue")
      });
      addComponent({
        name: "BugReportModal",
        filePath: resolver.resolve("./runtime/components/BugReportModal.vue")
      });
      addComponent({
        name: "BugIcon",
        filePath: resolver.resolve("./runtime/components/BugIcon.vue")
      });
      addImports({
        name: "useBugReport",
        from: resolver.resolve("./runtime/composables/useBugReport")
      });
      addServerHandler({
        route: "/api/bug-report",
        handler: resolver.resolve("./runtime/server/api/bug-report.post"),
        method: "post"
      });
      addServerHandler({
        route: "/api/screenshot",
        handler: resolver.resolve("./runtime/server/api/screenshot.post"),
        method: "post"
      });
    }
  }
});

export { module as default };
