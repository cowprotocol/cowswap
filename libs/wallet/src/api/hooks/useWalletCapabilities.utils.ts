export interface WidgetProviderMetaInfoState {
  data?: { providerWcMetadata?: unknown } | null
  isLoading: boolean
}

export interface WalletCapabilitiesEnvironment {
  isInjectedMobileBrowser: boolean
  isInjectedWidget: boolean
  isMobile: boolean
}

export function shouldCheckCapabilities(
  isWalletConnect: boolean,
  { data, isLoading }: WidgetProviderMetaInfoState,
  environment: WalletCapabilitiesEnvironment,
): boolean {
  // When widget in the mobile device, wait till providerWcMetadata is loaded
  // In order to detect if is connected to WalletConnect
  if (environment.isInjectedWidget && environment.isMobile && isLoading) {
    return false
  }

  const isWalletConnectViaWidget = Boolean(data?.providerWcMetadata)

  if (isWalletConnect || isWalletConnectViaWidget) {
    return false
  }

  // Some injected mobile browsers expose wallet_getCapabilities but never settle the request.
  // Treat them as capability-unknown so regular trading is not blocked by WalletCapabilitiesLoading.
  if (environment.isInjectedMobileBrowser) {
    return false
  }

  return true
}
