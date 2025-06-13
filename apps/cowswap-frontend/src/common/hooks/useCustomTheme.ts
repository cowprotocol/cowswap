import { useMemo } from 'react'

import { ACTIVE_CUSTOM_THEME, CustomTheme } from '@cowprotocol/common-const'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

// TODO: load them from feature flags when we want to enable again
const isChristmasEnabled = false
const isHalloweenEnabled = false

export function useCustomTheme(): CowSwapTheme | undefined {
  const [darkMode] = useDarkModeManager()

  return useMemo(() => {
    if (ACTIVE_CUSTOM_THEME === CustomTheme.HALLOWEEN && darkMode && isHalloweenEnabled) {
      return 'darkHalloween'
    }
    if (ACTIVE_CUSTOM_THEME === CustomTheme.CHRISTMAS && isChristmasEnabled) {
      return darkMode ? 'darkChristmas' : 'lightChristmas'
    }
    return undefined
  }, [darkMode])
}
