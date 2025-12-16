import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import type { FeatureFlags } from '@cowprotocol/common-const'
import { CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { featureFlagsAtom, featureFlagsHydratedAtom } from 'common/state/featureFlagsState'

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
  const featureFlagsFromAtom = useAtomValue(featureFlagsAtom)
  const featureFlagsHydrated = useAtomValue(featureFlagsHydratedAtom)
  const featureFlagsFromLaunchDarkly = useFeatureFlags()
  const isWidget = isInjectedWidget()

  // Use LD flags until Jotai hydration completes to keep theme consistent on first render
  const effectiveFeatureFlags = useMemo(
    () => (featureFlagsHydrated ? featureFlagsFromAtom : featureFlagsFromLaunchDarkly),
    [featureFlagsHydrated, featureFlagsFromAtom, featureFlagsFromLaunchDarkly],
  )

  const resolvedTheme = useMemo(
    () => resolveCowSwapTheme(darkMode, effectiveFeatureFlags),
    [darkMode, effectiveFeatureFlags],
  )

  // We don't want to set any custom theme for the widget
  if (isWidget) {
    return undefined
  }

  return resolvedTheme
}
