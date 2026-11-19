import { useMemo } from 'react'

import type { FeatureFlags } from '@cowprotocol/common-const'
import { CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget, isPr } from '@cowprotocol/common-utils'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

/**
 * Workaround while `isViceThemeEnabled` is missing from LaunchDarkly: turns the Vice theme on in
 * PR preview builds so it can be reviewed. Delete once the flag exists.
 */
const FORCE_VICE_THEME_IN_PR_PREVIEWS = true

export function resolveCowSwapTheme(darkMode: boolean, featureFlags?: FeatureFlags): CowSwapTheme | undefined {
  const activeTheme = resolveCustomThemeForContext(featureFlags, { darkModeEnabled: darkMode })

  if (activeTheme === CustomTheme.HALLOWEEN) {
    return 'darkHalloween'
  }

  if (activeTheme === CustomTheme.CHRISTMAS) {
    return darkMode ? 'darkChristmas' : 'lightChristmas'
  }

  if (activeTheme === CustomTheme.VICE) {
    return 'darkVice'
  }

  return undefined
}

export function useCustomTheme(): CowSwapTheme | undefined {
  const [darkMode] = useDarkModeManager()
  const featureFlags = useFeatureFlags()
  const isWidget = isInjectedWidget()

  const resolvedTheme = useMemo(() => {
    const isViceThemeForced = FORCE_VICE_THEME_IN_PR_PREVIEWS && isPr
    const flags = isViceThemeForced ? { ...featureFlags, isViceThemeEnabled: true } : featureFlags

    return resolveCowSwapTheme(darkMode, flags)
  }, [darkMode, featureFlags])

  // We don't want to set any custom theme for the widget
  if (isWidget) {
    return undefined
  }

  return resolvedTheme
}
