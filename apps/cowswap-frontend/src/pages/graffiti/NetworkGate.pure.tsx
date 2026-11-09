import type { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

export interface NetworkGateProps {
  chainId: SupportedChainId
  switching: boolean
  onSwitch: () => void
}

const GatePanel = styled(styledEl.Panel)`
  max-width: 460px;
  margin: 10vh auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
`

const GateButton = styled(styledEl.PrimaryButton)`
  min-width: 240px;
`

const Blurb = styled.p`
  margin: 0;
  line-height: 1.5;
  color: #b8b8cc;
`

const Accent = styled.strong`
  color: ${styledEl.wallColors.neon};
`

/** Painting needs the Solana network: shown while the wallet is on an EVM chain. */
export function NetworkGate({ chainId, switching, onSwitch }: NetworkGateProps): ReactNode {
  const chainName = getChainInfo(chainId).name.toUpperCase()

  return (
    <styledEl.Page $auto>
      <GatePanel>
        <styledEl.BigEmoji>🖍</styledEl.BigEmoji>
        <styledEl.WallHeading>GRAFFITI WALL</styledEl.WallHeading>
        <Blurb>
          <Trans>
            Welcome! This wall is painted with <Accent>{TOKEN_SYMBOL}</Accent>, a Solana token — every painted cell
            burns 1 {TOKEN_SYMBOL}.
          </Trans>
          <br />
          <Trans>
            You&apos;re currently on <strong>{chainName}</strong>. Select the <Accent>Solana</Accent> network to start
            painting.
          </Trans>
        </Blurb>
        <GateButton disabled={switching} onClick={onSwitch}>
          {switching ? <Trans>Switching…</Trans> : <Trans>→ Switch to Solana</Trans>}
        </GateButton>
        <styledEl.Muted>
          <Trans>or pick Solana from the network selector in the header</Trans>
        </styledEl.Muted>
      </GatePanel>
    </styledEl.Page>
  )
}
