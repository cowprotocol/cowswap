import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsGraffitiWallEnabled } from './useIsGraffitiWallEnabled'

/**
 * Whether the settings menu should offer the graffiti theme at all — only where it can actually
 * apply. Deliberately independent of the setting's own value, so turning the theme off does not
 * take the entry that turns it back on with it.
 */
export function useIsGraffitiThemeOffered(): boolean {
  const { chainId } = useWalletInfo()
  const { isSolanaThemeEnabled } = useFeatureFlags()
  const isGraffitiWallEnabled = useIsGraffitiWallEnabled()

  return isSolanaChain(chainId) && isGraffitiWallEnabled && !!isSolanaThemeEnabled
}
