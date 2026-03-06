export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui'],
  ssr: true,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // Bug Report Module Configuration
  bug: {
    // Linear API configuration (set via environment variables)
    linearApiKey: process.env.NUXT_LINEAR_API_KEY,
    linearTeamName: process.env.NUXT_LINEAR_TEAM_NAME,
    linearProjectName: process.env.NUXT_LINEAR_PROJECT_NAME,

    // UI Configuration
    autoShow: true,
    position: 'bottom-right',
    buttonColor: 'red',

    // Features
    enableScreenshot: true,
    enableBrowserInfo: true,
    enableConsoleLogs: true,
    maxConsoleLogs: 50,

    // Theme
    theme: 'auto',

    // HTTP Basic Authentication (optional)
    // For pages behind htaccess/HTTP Auth
    httpAuth: process.env.NUXT_HTTP_AUTH_USERNAME && process.env.NUXT_HTTP_AUTH_PASSWORD
      ? {
          username: process.env.NUXT_HTTP_AUTH_USERNAME,
          password: process.env.NUXT_HTTP_AUTH_PASSWORD,
        }
      : undefined,
  },
})
