import { useAtomValue } from 'jotai'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import type { CowSwapTheme } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { useIsGraffitiWallEnabled } from './useIsGraffitiWallEnabled'

import { isGraffitiWallPath, resolveGraffitiTheme } from '../graffitiWall.utils'
import { graffitiThemeEnabledAtom } from '../state/graffitiTheme.atoms'

/** The graffiti wall theme where it applies, otherwise nothing. Widgets never take it. */
export function useGraffitiTheme(): CowSwapTheme | undefined {
  const { chainId } = useWalletInfo()
  const { pathname } = useLocation()
  const { isSolanaThemeEnabled } = useFeatureFlags()
  const wallEnabled = useIsGraffitiWallEnabled()
  const themeEnabled = useAtomValue(graffitiThemeEnabledAtom)

  if (isInjectedWidget()) return undefined

  return resolveGraffitiTheme({
    wallEnabled,
    themeFlagEnabled: !!isSolanaThemeEnabled,
    onSolanaChain: isSolanaChain(chainId),
    onWallPage: isGraffitiWallPath(pathname),
    optedOut: !themeEnabled,
  })
}
