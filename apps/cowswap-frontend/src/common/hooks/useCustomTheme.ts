import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import type { CustomThemeContext, FeatureFlags } from '@cowprotocol/common-const'
import { CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import type { CowSwapTheme } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { Routes } from 'common/constants/routes'
import { graffitiThemeEnabledAtom } from 'common/state/graffitiTheme'

import { useIsGraffitiWallEnabled } from './featureFlags/useIsGraffitiWallEnabled'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

/** The wall page and the claim screen it sends people to are one experience, and share its theme. */
export function isWallPagePath(pathname: string): boolean {
  return pathname.startsWith(Routes.GRAFFITI)
}

export function resolveCowSwapTheme(
  darkMode: boolean,
  featureFlags?: FeatureFlags,
  context: Omit<CustomThemeContext, 'darkModeEnabled'> = {},
): CowSwapTheme | undefined {
  const activeTheme = resolveCustomThemeForContext(featureFlags, { ...context, darkModeEnabled: darkMode })

  if (activeTheme === CustomTheme.SOLANA) {
    return 'darkSolana'
  }

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
  const featureFlags = useFeatureFlags()
  const { chainId } = useWalletInfo()
  const { pathname } = useLocation()
  const isWidget = isInjectedWidget()
  const onSolanaChain = isSolanaChain(chainId)
  const onWallPage = isWallPagePath(pathname)
  const graffitiWallEnabled = useIsGraffitiWallEnabled()
  const graffitiThemeOptOut = !useAtomValue(graffitiThemeEnabledAtom)

  const resolvedTheme = useMemo(
    () =>
      resolveCowSwapTheme(darkMode, featureFlags, {
        onSolanaChain,
        graffitiWallEnabled,
        onWallPage,
        graffitiThemeOptOut,
      }),
    [darkMode, featureFlags, onSolanaChain, graffitiWallEnabled, onWallPage, graffitiThemeOptOut],
  )

  // We don't want to set any custom theme for the widget
  if (isWidget) {
    return undefined
  }

  return resolvedTheme
}
