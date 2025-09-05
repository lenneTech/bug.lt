import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  bug: {
    linearApiKey: 'test-key',
    linearTeamName: 'Test Team',
    autoShow: true,
    position: 'top-left',
    buttonColor: '#00ff00',
    buttonText: 'Report Bug',
    enableScreenshot: true,
    enableBrowserInfo: true,
    enableConsoleLogs: true,
    theme: 'dark',
    maxConsoleLogs: 100,
  },
})
