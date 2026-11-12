import { useMemo } from 'react'

import type { FeatureFlags } from '@cowprotocol/common-const'
import { CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import type { CowSwapTheme } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsGraffitiWallEnabled } from './featureFlags/useIsGraffitiWallEnabled'

import { useDarkModeManager } from '../../legacy/state/user/hooks'

export function resolveCowSwapTheme(
  darkMode: boolean,
  featureFlags?: FeatureFlags,
  onSolanaChain = false,
  graffitiWallEnabled = false,
): CowSwapTheme | undefined {
  const activeTheme = resolveCustomThemeForContext(featureFlags, {
    darkModeEnabled: darkMode,
    onSolanaChain,
    graffitiWallEnabled,
  })

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
  const isWidget = isInjectedWidget()
  const onSolanaChain = isSolanaChain(chainId)
  const graffitiWallEnabled = useIsGraffitiWallEnabled()

  const resolvedTheme = useMemo(
    () => resolveCowSwapTheme(darkMode, featureFlags, onSolanaChain, graffitiWallEnabled),
    [darkMode, featureFlags, onSolanaChain, graffitiWallEnabled],
  )

  // We don't want to set any custom theme for the widget
  if (isWidget) {
    return undefined
  }

  return resolvedTheme
}
