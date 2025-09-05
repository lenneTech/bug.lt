import { defineNuxtPlugin } from "#app";
import { createApp } from "vue";
import { initializeConsoleLogging } from "./utils/consoleLogs.js";
import BugReportButton from "./components/BugReportButton.vue";
import BugReportModal from "./components/BugReportModal.vue";
export default defineNuxtPlugin({
  name: "@lenne.tech/bug.lt",
  setup(nuxtApp) {
    if (import.meta.server) return;
    if (import.meta.client) {
      initializeConsoleLogging();
    }
    nuxtApp.vueApp.component("BugReportButton", BugReportButton);
    nuxtApp.vueApp.component("BugReportModal", BugReportModal);
    nuxtApp.hook("app:mounted", () => {
      const runtimeConfig = useRuntimeConfig();
      const config = runtimeConfig.public.bugLt;
      if (config?.autoShow) {
        const buttonContainer = document.createElement("div");
        buttonContainer.id = "bug-lt-button";
        document.body.appendChild(buttonContainer);
        const buttonApp = createApp(BugReportButton);
        buttonApp.mount(buttonContainer);
      }
    });
  }
});
