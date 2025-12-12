import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import type { FeatureFlags } from '@cowprotocol/common-const'
import { CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { COW_SWAP_THEMES, type CowSwapTheme } from '@cowprotocol/ui'

import { featureFlagsAtom, featureFlagsHydratedAtom } from 'common/state/featureFlagsState'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

// Keep track of the resolved custom theme in local storage
const LOCAL_STORAGE_KEY = 'cow:resolvedCustomTheme'

function isThemeCompatibleWithMode(theme: CowSwapTheme, darkMode: boolean): boolean {
  if (theme === 'darkHalloween' || theme === 'darkChristmas' || theme === 'dark') {
    return darkMode
  }

  if (theme === 'lightChristmas' || theme === 'light') {
    return !darkMode
  }

  return true
}

function readCachedTheme(darkMode: boolean): CowSwapTheme | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return undefined

    const parsed = JSON.parse(raw) as string
    if (!parsed || !COW_SWAP_THEMES.includes(parsed as CowSwapTheme)) {
      return undefined
    }

    const theme = parsed as CowSwapTheme

    return isThemeCompatibleWithMode(theme, darkMode) ? theme : undefined
  } catch {
    return undefined
  }
}

function cacheTheme(theme: CowSwapTheme): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(theme))
  } catch {
    // Ignore storage failures
  }
}

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

  const cachedTheme = useMemo(() => readCachedTheme(darkMode), [darkMode])

  // Use LD flags until Jotai hydration completes to keep theme consistent on first render
  const effectiveFeatureFlags = useMemo(
    () => (featureFlagsHydrated ? featureFlagsFromAtom : featureFlagsFromLaunchDarkly),
    [featureFlagsHydrated, featureFlagsFromAtom, featureFlagsFromLaunchDarkly],
  )

  const resolvedTheme = useMemo(
    () => resolveCowSwapTheme(darkMode, effectiveFeatureFlags),
    [darkMode, effectiveFeatureFlags],
  )

  useEffect(() => {
    if (resolvedTheme) {
      cacheTheme(resolvedTheme)
    }
  }, [resolvedTheme])

  // We don't want to set any custom theme for the widget
  if (isWidget) {
    return undefined
  }

  return resolvedTheme ?? cachedTheme
}
