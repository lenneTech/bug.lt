export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // Bug Report Module Configuration
  bug: {
    // Linear API configuration (set via environment variables)
    linearApiKey: process.env.LINEAR_API_KEY,
    linearTeamName: process.env.LINEAR_TEAM_NAME,
    linearProjectName: process.env.LINEAR_PROJECT_NAME,

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
  },
})
