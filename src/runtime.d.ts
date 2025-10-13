declare module '@nuxt/schema' {
  interface RuntimeConfig {
    bugLt: {
      linearApiKey?: string
      linearTeamName?: string
      linearProjectName?: string
      httpAuth?: {
        username: string
        password: string
      }
    }
  }

  interface PublicRuntimeConfig {
    bugLt: {
      enabled?: boolean
      ui?: boolean
      autoShow?: boolean
      position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
      buttonColor?: string
      buttonText?: string
      buttonIcon?: string
      enableScreenshot?: boolean
      enableBrowserInfo?: boolean
      enableConsoleLogs?: boolean
      theme?: 'light' | 'dark' | 'auto'
      maxConsoleLogs?: number
    }
  }
}

export {}
