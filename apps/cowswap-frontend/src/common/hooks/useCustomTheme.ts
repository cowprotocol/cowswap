import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import type { FeatureFlags } from '@cowprotocol/common-const'
import { CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { featureFlagsAtom, featureFlagsHydratedAtom } from 'common/state/featureFlagsState'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

// FORCE CHRISTMAS THEME FOR LOCALHOST TESTING
const FORCE_CHRISTMAS_THEME =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

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
  const featureFlagsFromAtom = useAtomValue(featureFlagsAtom)
  const featureFlagsHydrated = useAtomValue(featureFlagsHydratedAtom)
  const featureFlagsFromLaunchDarkly = useFeatureFlags()
  const isWidget = isInjectedWidget()

  // Use LD flags until Jotai hydration completes to keep theme consistent on first render
  const effectiveFeatureFlags = useMemo(
    () => (featureFlagsHydrated ? featureFlagsFromAtom : featureFlagsFromLaunchDarkly),
    [featureFlagsHydrated, featureFlagsFromAtom, featureFlagsFromLaunchDarkly],
  )

  // FORCE CHRISTMAS FOR LOCALHOST
  if (FORCE_CHRISTMAS_THEME) {
    const forcedTheme = darkMode ? 'darkChristmas' : 'lightChristmas'
    console.log('🎄 [useCustomTheme] FORCING CHRISTMAS THEME:', {
      darkMode,
      forcedTheme,
      stack: new Error().stack,
    })
    return forcedTheme
  }

  // We don't want to set any custom theme for the widget
  if (isWidget) {
    console.log('🚫 [useCustomTheme] Widget mode - no custom theme')
    return undefined
  }

  const resolvedTheme = resolveCowSwapTheme(darkMode, effectiveFeatureFlags)

  console.log('🎨 [useCustomTheme] Theme resolution:', {
    darkMode,
    featureFlagsHydrated,
    featureFlagsFromAtom: JSON.stringify(featureFlagsFromAtom),
    featureFlagsFromLD: JSON.stringify(featureFlagsFromLaunchDarkly),
    effectiveFeatureFlags: JSON.stringify(effectiveFeatureFlags),
    resolvedTheme,
    isWidget,
  })

  return resolvedTheme
}
