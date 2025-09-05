const consoleLogHistory = [];
const maxHistorySize = 1e3;
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};
let isInitialized = false;
export const initializeConsoleLogging = () => {
  if (isInitialized || typeof window === "undefined") return;
  isInitialized = true;
  const createLogEntry = (level, args) => {
    const messages = args.map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return arg.message;
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    });
    const entry = {
      level,
      message: messages,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (level === "error" && args.some((arg) => arg instanceof Error)) {
      const error = args.find((arg) => arg instanceof Error);
      entry.stack = error.stack;
    }
    return entry;
  };
  const addToHistory = (entry) => {
    consoleLogHistory.push(entry);
    if (consoleLogHistory.length > maxHistorySize) {
      consoleLogHistory.shift();
    }
  };
  console.log = (...args) => {
    originalConsole.log(...args);
    addToHistory(createLogEntry("log", args));
  };
  console.info = (...args) => {
    originalConsole.info(...args);
    addToHistory(createLogEntry("info", args));
  };
  console.warn = (...args) => {
    originalConsole.warn(...args);
    addToHistory(createLogEntry("warn", args));
  };
  console.error = (...args) => {
    originalConsole.error(...args);
    addToHistory(createLogEntry("error", args));
  };
  console.debug = (...args) => {
    originalConsole.debug(...args);
    addToHistory(createLogEntry("debug", args));
  };
  window.addEventListener("error", (event) => {
    addToHistory({
      level: "error",
      message: [event.message],
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stack: event.error?.stack
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    addToHistory({
      level: "error",
      message: [String(event.reason)],
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stack: event.reason?.stack
    });
  });
};
export const getConsoleLogs = (limit = 50) => {
  return consoleLogHistory.slice(-limit).map((log) => ({ ...log }));
};
export const clearConsoleLogs = () => {
  consoleLogHistory.length = 0;
};
export const resetConsoleLogging = () => {
  clearConsoleLogs();
  isInitialized = false;
  if (typeof window !== "undefined") {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
  }
};
