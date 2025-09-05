export const captureScreenshot = async (element, options) => {
  if (typeof window === "undefined") {
    throw new TypeError("Screenshot capture is only available in the browser");
  }
  try {
    const selector = element ? getElementSelector(element) : void 0;
    const viewport = options?.viewport || { width: 1920, height: 1080 };
    const theme = detectCurrentTheme();
    const response = await $fetch("/api/screenshot", {
      method: "POST",
      body: {
        url: window.location.href,
        selector,
        viewport,
        theme
      }
    });
    if (!response?.success) {
      throw new Error(response.message || "Screenshot failed");
    }
    return response.screenshot;
  } catch (error) {
    console.error("Server-side screenshot failed:", error);
    throw new Error("Screenshot-Erfassung fehlgeschlagen");
  }
};
function detectCurrentTheme() {
  if (typeof window !== "undefined" && window.__NUXT_COLOR_MODE__) {
    return window.__NUXT_COLOR_MODE__.value === "dark" ? "dark" : "light";
  }
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    if (document.documentElement.classList.contains("light")) {
      return "light";
    }
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}
function getElementSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  if (element.className) {
    const classes = element.className.split(" ").filter((c) => c.length > 0);
    if (classes.length > 0) {
      return `.${classes.join(".")}`;
    }
  }
  return element.tagName.toLowerCase();
}
