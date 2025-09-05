export const getBrowserInfo = () => {
  if (typeof window === "undefined") {
    throw new TypeError("Browser info collection is only available in the browser");
  }
  const { navigator, location, document, screen } = window;
  if (!navigator) {
    throw new TypeError("Navigator is not available");
  }
  const systemInfo = getSystemInfo();
  const performanceInfo = getPerformanceInfo();
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    vendor: navigator.vendor,
    url: location.href,
    referrer: document.referrer,
    title: document.title,
    viewport: {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    },
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    },
    browser: systemInfo?.browser || { name: "Unknown", version: "Unknown" },
    os: systemInfo?.os || { name: "Unknown", version: "Unknown" },
    languages: systemInfo?.languages || [navigator.language],
    timezone: systemInfo?.timezone || "Unknown",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    performance: performanceInfo || void 0
  };
};
export const getSystemInfo = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const { navigator } = window;
  if (!navigator) {
    return null;
  }
  const getBrowserDetails = (userAgent) => {
    const browsers = [
      { name: "Chrome", regex: /Chrome\/([0-9.]+)/ },
      { name: "Firefox", regex: /Firefox\/([0-9.]+)/ },
      { name: "Safari", regex: /Safari\/([0-9.]+)/ },
      { name: "Edge", regex: /Edge\/([0-9.]+)/ },
      { name: "Opera", regex: /Opera\/([0-9.]+)/ }
    ];
    for (const browser2 of browsers) {
      const match = userAgent.match(browser2.regex);
      if (match) {
        return {
          name: browser2.name,
          version: match[1]
        };
      }
    }
    return {
      name: "Unknown",
      version: "Unknown"
    };
  };
  const getOSDetails = (userAgent) => {
    const systems = [
      { name: "Windows", regex: /Windows NT ([0-9.]+)/ },
      { name: "macOS", regex: /Mac OS X ([0-9_.]+)/ },
      { name: "Linux", regex: /Linux/ },
      { name: "Android", regex: /Android ([0-9.]+)/ },
      { name: "iOS", regex: /OS ([0-9_]+)/ }
    ];
    for (const system of systems) {
      const match = userAgent.match(system.regex);
      if (match) {
        return {
          name: system.name,
          version: match[1] ? match[1].replace(/_/g, ".") : "Unknown"
        };
      }
    }
    return {
      name: "Unknown",
      version: "Unknown"
    };
  };
  const browser = getBrowserDetails(navigator.userAgent);
  const os = getOSDetails(navigator.userAgent);
  return {
    browser,
    os,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: navigator.userAgent
  };
};
export const getPerformanceInfo = () => {
  if (typeof window === "undefined" || !window.performance) {
    return null;
  }
  const { performance } = window;
  const navigation = performance.getEntriesByType("navigation")[0];
  if (!navigation) {
    return null;
  }
  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime || null,
    firstContentfulPaint: performance.getEntriesByName("first-contentful-paint")[0]?.startTime || null,
    navigationStart: navigation.fetchStart,
    // Use fetchStart instead of navigationStart
    responseEnd: navigation.responseEnd,
    domComplete: navigation.domComplete
  };
};
