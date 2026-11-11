import type { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { HeroPanel } from './HeroPanel.pure'
import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

export interface NetworkGateProps {
  chainId: SupportedChainId
  switching: boolean
  onSwitch: () => void
}

const Accent = styled.strong`
  color: ${styledEl.wallColors.neon};
`

/** Painting needs the Solana network: shown while the wallet is on an EVM chain. */
export function NetworkGate({ chainId, switching, onSwitch }: NetworkGateProps): ReactNode {
  const chainName = getChainInfo(chainId).name.toUpperCase()

  return (
    <styledEl.Page $auto>
      <styledEl.CenteredPage>
        <styledEl.ModalPanel>
          <HeroPanel>
            <styledEl.WallHeading>GRAFFITI WALL</styledEl.WallHeading>

            <styledEl.PanelText>
              <Trans>
                Welcome! This wall is painted with <Accent>{TOKEN_SYMBOL}</Accent>, a Solana token. Every painted cell
                burns 1 {TOKEN_SYMBOL}.
              </Trans>
            </styledEl.PanelText>
            <styledEl.PanelText>
              <Trans>
                You&apos;re currently on <strong>{chainName}</strong>. Select the <Accent>Solana</Accent> network to
                start painting.
              </Trans>
            </styledEl.PanelText>

            <styledEl.PrimaryButton disabled={switching} onClick={onSwitch}>
              {switching ? <Trans>Switching…</Trans> : <Trans>→ Switch to Solana</Trans>}
            </styledEl.PrimaryButton>

            <styledEl.Muted>
              <Trans>or pick Solana from the network selector in the header</Trans>
            </styledEl.Muted>
          </HeroPanel>
        </styledEl.ModalPanel>
      </styledEl.CenteredPage>
    </styledEl.Page>
  )
}
