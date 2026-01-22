export const LAUNCH_DARKLY_CLIENT_KEY = process.env.REACT_APP_LAUNCH_DARKLY_KEY || ''
export const LAUNCH_DARKLY_VIEM_MIGRATION =
  typeof window !== 'undefined' ? localStorage.getItem('useViemMigration') === 'true' : false
