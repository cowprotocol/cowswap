import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { CustomTheme, isCustomThemeActive } from '@cowprotocol/common-const'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

export function useCustomTheme(): CowSwapTheme | undefined {
  const [darkMode] = useDarkModeManager()
  const featureFlags = useAtomValue(featureFlagsAtom)

  return useMemo(() => {
    if (isCustomThemeActive(CustomTheme.HALLOWEEN, featureFlags) && darkMode) {
      return 'darkHalloween'
    }
    if (isCustomThemeActive(CustomTheme.CHRISTMAS, featureFlags)) {
      return darkMode ? 'darkChristmas' : 'lightChristmas'
    }
    return undefined
  }, [darkMode, featureFlags])
}
