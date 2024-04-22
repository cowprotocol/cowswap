import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { safeAppsSDK } from '@cowprotocol/wallet-provider'

export function useSafeAppsSdk(): SafeAppsSDK | null {
  return safeAppsSDK
}
