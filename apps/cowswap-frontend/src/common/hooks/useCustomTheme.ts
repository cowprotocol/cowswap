import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import type { FeatureFlags } from '@cowprotocol/common-const'
import { CustomTheme, readPersistedCustomThemeFlags, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import { useFeatureFlags, useTheme } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { featureFlagsStatusAtom, FeatureFlagsStatus } from '../state/featureFlagsState'

const persistedCustomThemeFlags = readPersistedCustomThemeFlags()

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

/**
 * LaunchDarkly has no flags at all until it resolves, which is after the first paint. For that
 * stretch the flags of the last visit stand in, so a returning visitor starts in the theme they
 * will end up in. Once LaunchDarkly has answered, or given up, only its flags count.
 */
export function selectCustomThemeFlags(
  liveFlags: FeatureFlags,
  flagsStatus: FeatureFlagsStatus,
  persistedFlags: FeatureFlags,
): FeatureFlags {
  const awaitingFlags = flagsStatus === 'loading' && Object.keys(liveFlags).length === 0

  return awaitingFlags ? persistedFlags : liveFlags
}

export function useCustomTheme(): CowSwapTheme | undefined {
  const { darkMode } = useTheme()
  const liveFlags = useFeatureFlags()
  const flagsStatus = useAtomValue(featureFlagsStatusAtom)
  const featureFlags = selectCustomThemeFlags(liveFlags, flagsStatus, persistedCustomThemeFlags)
  const isWidget = isInjectedWidget()

  const resolvedTheme = useMemo(() => resolveCowSwapTheme(darkMode, featureFlags), [darkMode, featureFlags])

  // We don't want to set any custom theme for the widget
  if (isWidget) {
    return undefined
  }

  return resolvedTheme
}
