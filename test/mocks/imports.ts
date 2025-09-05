// Mock file for #imports in testing
export const useRuntimeConfig = (event?: any) => {
  return {
    bugLt: {
      linearApiKey: 'test-api-key',
      linearTeamName: 'Test Team',
      linearProjectName: 'Test Project',
    },
  }
}