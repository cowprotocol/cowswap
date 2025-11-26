import { ReactNode } from 'react'

import CROSS_CHAIN_ICONS from '@cowprotocol/assets/cross-chain-icons.svg'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import { useTheme } from 'styled-components'

import * as styledEl from './styled'

export interface CrossChainUnlockScreenProps {
  handleUnlock: Command
}

export function CrossChainUnlockScreen({ handleUnlock }: CrossChainUnlockScreenProps): ReactNode {
  const { darkMode } = useTheme()

  return (
    <>
      <styledEl.Container darkMode={darkMode}>
        <styledEl.Content>
          <styledEl.Title><Trans>Cross-chain swaps are here</Trans></styledEl.Title>
          <styledEl.Subtitle>
            <Trans>
              Mooove between <br /> any chain, hassle-free
            </Trans>
          </styledEl.Subtitle>
        </styledEl.Content>
        <styledEl.Illustration>
          <SVG src={CROSS_CHAIN_ICONS} />
        </styledEl.Illustration>
      </styledEl.Container>
      <styledEl.ButtonWrapper>
        <ButtonPrimary id="unlock-cross-chain-swap-btn" onClick={handleUnlock}>
          <Trans>Swap now</Trans>
        </ButtonPrimary>
      </styledEl.ButtonWrapper>
    </>
  )
}
