import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { safeAppsSDK } from '../connectors/safeAppConnector'

export function useSafeAppsSdk(): SafeAppsSDK | null {
  return safeAppsSDK
}
