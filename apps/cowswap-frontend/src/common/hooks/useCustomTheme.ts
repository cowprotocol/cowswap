import { useAtomValue } from 'jotai'

import { CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import type { FeatureFlags } from '@cowprotocol/common-const'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

export function resolveCowSwapTheme(darkMode: boolean, featureFlags?: FeatureFlags): CowSwapTheme | undefined {
  const activeTheme = resolveCustomThemeForContext(featureFlags, { darkModeEnabled: darkMode })

  if (activeTheme === CustomTheme.HALLOWEEN) {
    return 'darkHalloween'
  }

  if (activeTheme === CustomTheme.CHRISTMAS) {
    return darkMode ? 'darkChristmas' : 'lightChristmas'
  }

  return undefined
}

export function useCustomTheme(): CowSwapTheme | undefined {
  const [darkMode] = useDarkModeManager()
  const featureFlags = useAtomValue(featureFlagsAtom)

  return resolveCowSwapTheme(darkMode, featureFlags)
}
