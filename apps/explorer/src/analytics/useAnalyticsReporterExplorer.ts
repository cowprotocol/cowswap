
import { useAnalyticsReporter } from '@cowprotocol/ui'

import { useNetworkId } from 'state/network'

import { cowAnalytics, pixelAnalytics, webVitalsAnalytics } from '.'

/**
 * Hook to report analytics for Explorer
 * @param props
 * @returns
 */
export function useAnalyticsReporterExplorer() {
  const chainId = useNetworkId()

  return useAnalyticsReporter({
    account: undefined, // For now, explorer doesn't have connect wallet functionality
    walletName: undefined, // For now, explorer doesn't have connect wallet functionality
    chainId: chainId || undefined,
    cowAnalytics,
    pixelAnalytics,
    webVitalsAnalytics,
  })
}
