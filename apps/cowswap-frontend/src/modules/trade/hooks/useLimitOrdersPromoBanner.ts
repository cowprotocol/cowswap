import { useCallback } from 'react'

import { useMatch } from 'react-router-dom'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { Routes } from 'common/constants/routes'
import { SHOW_LIMIT_ORDERS_PROMO } from 'common/constants/featureFlags'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

const STORAGE_KEY = 'limitOrdersPromoBanner:v0'

const promoBannerAtom = atomWithStorage<boolean>(STORAGE_KEY, true)

export function useLimitOrdersPromoBanner() {
  const isLimitOrdersTab = !!(useMatch(Routes.LIMIT_ORDER) || useMatch(Routes.LONG_LIMIT_ORDER))
  const { standaloneMode } = useInjectedWidgetParams()
  const [isVisible, setIsVisible] = useAtom(promoBannerAtom)

  const shouldBeVisible = !standaloneMode && !isInjectedWidget() && SHOW_LIMIT_ORDERS_PROMO && isVisible

  const onDismiss = useCallback(() => {
    setIsVisible(false)
  }, [setIsVisible])

  return {
    isVisible: shouldBeVisible,
    onDismiss,
    isLimitOrdersTab,
  }
}
