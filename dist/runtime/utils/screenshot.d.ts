export declare const captureScreenshot: (element?: HTMLElement, options?: {
    quality?: number;
    viewport?: {
        width: number;
        height: number;
    };
}) => Promise<string>;
