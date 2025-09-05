import type { ConsoleLogEntry } from '../types/index.js';
export declare const initializeConsoleLogging: () => void;
export declare const getConsoleLogs: (limit?: number) => ConsoleLogEntry[];
export declare const clearConsoleLogs: () => void;
export declare const resetConsoleLogging: () => void;
