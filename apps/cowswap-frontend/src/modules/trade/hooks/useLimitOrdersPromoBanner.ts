import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { useMatch } from 'react-router'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { Routes } from 'common/constants/routes'

const STORAGE_KEY = 'limitOrdersPromoBanner:v0'

const promoBannerAtom = atomWithStorage<boolean>(STORAGE_KEY, true)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLimitOrdersPromoBanner() {
  const isLimitOrdersTab = !!useMatch(Routes.LIMIT_ORDER)
  const { standaloneMode } = useInjectedWidgetParams()
  const [isVisible, setIsVisible] = useAtom(promoBannerAtom)
  const { isLimitOrdersUpgradeBannerEnabled } = useFeatureFlags()

  const shouldBeVisible = !standaloneMode && !isInjectedWidget() && isLimitOrdersUpgradeBannerEnabled && isVisible

  const onDismiss = useCallback(() => {
    setIsVisible(false)
  }, [setIsVisible])

  return {
    isVisible,
    shouldBeVisible,
    onDismiss,
    isLimitOrdersTab,
  }
}
