import { useAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { CustomTheme, isCustomThemeEnabled } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { SettingsBox } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { useIsGraffitiWallEnabled } from 'common/hooks/featureFlags/useIsGraffitiWallEnabled'
import { graffitiThemeEnabledAtom } from 'common/state/graffitiTheme'

/**
 * Only shown where the theme can actually apply: on Solana, with the wall and its theme flag on.
 * Visibility deliberately ignores the setting's own value, so turning it off does not take the
 * toggle away with it.
 */
export function GraffitiThemeSettings(): ReactNode {
  const { chainId } = useWalletInfo()
  const featureFlags = useFeatureFlags()
  const graffitiWallEnabled = useIsGraffitiWallEnabled()
  const [enabled, setEnabled] = useAtom(graffitiThemeEnabledAtom)

  const toggle = useCallback((value?: boolean) => setEnabled((current) => value ?? !current), [setEnabled])

  const available =
    isSolanaChain(chainId) && graffitiWallEnabled && isCustomThemeEnabled(CustomTheme.SOLANA, featureFlags)

  if (!available) return null

  return (
    <SettingsBox
      id="toggle-graffiti-theme-button"
      title={t`Graffiti theme`}
      tooltip={t`Paints CoW Swap with the live graffiti wall while you are on Solana. Turning it off restores the standard look. The wall page itself keeps the theme.`}
      checked={enabled}
      toggle={toggle}
    />
  )
}
