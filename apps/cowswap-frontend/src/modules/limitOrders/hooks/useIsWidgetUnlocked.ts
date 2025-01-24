import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { useLimitOrdersPromoBanner } from 'modules/trade/hooks/useLimitOrdersPromoBanner'

import { useLimitOrdersRawState } from './useLimitOrdersRawState'

export function useIsWidgetUnlocked(): boolean {
  const rawState = useLimitOrdersRawState()
  const { isVisible: isPromoBannerVisible } = useLimitOrdersPromoBanner()
  const { isLimitOrdersUpgradeBannerEnabled } = useFeatureFlags()

  return useMemo(() => {
    // If promo feature is enabled:
    // - When banner is visible, keep everything locked (like unlock screen)
    // - When banner is dismissed, bypass unlock check completely
    if (isLimitOrdersUpgradeBannerEnabled) {
      // When promo is enabled, we're unlocked only when the banner is NOT visible
      return !isPromoBannerVisible
    }

    // Otherwise use normal unlock logic
    return rawState.isUnlocked || isInjectedWidget()
  }, [isPromoBannerVisible, rawState.isUnlocked, isLimitOrdersUpgradeBannerEnabled])
}
