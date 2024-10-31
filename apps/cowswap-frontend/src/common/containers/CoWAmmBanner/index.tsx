import { useCallback } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { ClosableBanner } from '@cowprotocol/ui'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { cowAnalytics } from 'modules/analytics'

import { useIsProviderNetworkUnsupported } from '../../hooks/useIsProviderNetworkUnsupported'
import { CoWAmmBannerContent } from '../../pure/CoWAmmBannerContent'
import { dummyData, lpTokenConfig } from '../../pure/CoWAmmBannerContent/dummyData'

const ANALYTICS_URL = 'https://cow.fi/pools?utm_source=swap.cow.fi&utm_medium=web&utm_content=cow_amm_banner'

interface BannerProps {
  isTokenSelectorView?: boolean
}

export function CoWAmmBanner({ isTokenSelectorView }: BannerProps) {
  const isDarkMode = useIsDarkMode()
  const isInjectedWidgetMode = isInjectedWidget()
  const { account } = useWalletInfo()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()

  const key = isTokenSelectorView ? 'tokenSelector' : 'global'
  const handleCTAClick = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: `CoW AMM Banner [${key}] CTA Clicked`,
    })

    window.open(ANALYTICS_URL, '_blank')
  }, [key])

  const handleClose = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: `CoW AMM Banner [${key}] Closed`,
    })
  }, [key])

  const bannerId = `cow_amm_banner_2024_va_${key}`

  const isSmartContractWallet = useIsSmartContractWallet()

  if (isInjectedWidgetMode || !account || isChainIdUnsupported) return null

  return ClosableBanner(bannerId, (close) => (
    <CoWAmmBannerContent
      id={bannerId}
      isDarkMode={isDarkMode}
      title="CoW AMM"
      ctaText={isSmartContractWallet ? 'Booooost APR!' : 'Booooost APR gas-free!'}
      isTokenSelectorView={!!isTokenSelectorView}
      selectedState="noLp" // TODO
      dummyData={dummyData}
      lpTokenConfig={lpTokenConfig}
      onCtaClick={handleCTAClick}
      onClose={() => {
        handleClose()
        close()
      }}
    />
  ))
}
