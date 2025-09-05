import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    enabled?: boolean;
    linearApiKey?: string;
    linearTeamName?: string;
    linearProjectName?: string;
    autoShow?: boolean;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    buttonColor?: string;
    buttonText?: string;
    buttonIcon?: string;
    enableScreenshot?: boolean;
    enableBrowserInfo?: boolean;
    enableConsoleLogs?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    customCSS?: string;
    maxConsoleLogs?: number;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions as BugReportOptions, ModuleOptions };
