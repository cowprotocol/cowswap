import { useCallback, useEffect, useState } from 'react'

import { useMatch } from 'react-router-dom'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { Routes } from 'common/constants/routes'
import { SHOW_LIMIT_ORDERS_PROMO } from 'common/constants/featureFlags'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

const STORAGE_KEY = 'limitOrdersPromoBanner:v0'

export function useLimitOrdersPromoBanner() {
  const isLimitOrdersTab = !!(useMatch(Routes.LIMIT_ORDER) || useMatch(Routes.LONG_LIMIT_ORDER))
  const [isVisible, setIsVisible] = useState(false)
  const { standaloneMode } = useInjectedWidgetParams()

  // Effect to handle feature flag changes
  useEffect(() => {
    // Never show the banner in widget mode (standalone or injected)
    if (standaloneMode || isInjectedWidget()) {
      setIsVisible(false)
      return
    }

    if (!SHOW_LIMIT_ORDERS_PROMO) {
      setIsVisible(false)
      return
    }

    const storedValue = localStorage.getItem(STORAGE_KEY)
    setIsVisible(storedValue === null)
  }, [SHOW_LIMIT_ORDERS_PROMO, standaloneMode])

  const onDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'dismissed')
    setIsVisible(false)
  }, [])

  return {
    isVisible,
    onDismiss,
    isLimitOrdersTab,
  }
}
