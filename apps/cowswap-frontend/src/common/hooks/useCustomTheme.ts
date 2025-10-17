import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { CustomTheme, getCustomThemePriority, isCustomThemeEnabled } from '@cowprotocol/common-const'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

export function resolveCowSwapTheme(
  darkMode: boolean,
  featureFlags?: Record<string, boolean | number | undefined>
): CowSwapTheme | undefined {
  for (const theme of getCustomThemePriority()) {
    if (!isCustomThemeEnabled(theme, featureFlags)) {
      continue
    }

    if (theme === CustomTheme.HALLOWEEN) {
      if (!darkMode) {
        continue
      }
      return 'darkHalloween'
    }

    if (theme === CustomTheme.CHRISTMAS) {
      return darkMode ? 'darkChristmas' : 'lightChristmas'
    }
  }

  return undefined
}

export function useCustomTheme(): CowSwapTheme | undefined {
  const [darkMode] = useDarkModeManager()
  const featureFlags = useAtomValue(featureFlagsAtom)

  return useMemo(() => resolveCowSwapTheme(darkMode, featureFlags), [darkMode, featureFlags])
}
