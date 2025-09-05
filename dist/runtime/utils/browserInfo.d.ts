import type { BrowserInfo } from '../types/index.js';
export declare const getBrowserInfo: () => BrowserInfo;
export declare const getSystemInfo: () => {
    browser: {
        name: string;
        version: string | undefined;
    };
    os: {
        name: string;
        version: string;
    };
    platform: string;
    language: string;
    languages: readonly string[];
    timezone: string;
    userAgent: string;
} | null;
export declare const getPerformanceInfo: () => {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number | null;
    firstContentfulPaint: number | null;
    navigationStart: number;
    responseEnd: number;
    domComplete: number;
} | null;
