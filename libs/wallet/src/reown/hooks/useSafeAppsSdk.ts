import SafeAppsSDK from '@safe-global/safe-apps-sdk'

const safeAppsSDK = new SafeAppsSDK()

export function useSafeAppsSdk(): SafeAppsSDK | null {
  return safeAppsSDK
}
