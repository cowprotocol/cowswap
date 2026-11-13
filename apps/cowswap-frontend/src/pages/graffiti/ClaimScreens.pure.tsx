// The claim a scanned link opened, as one more view of the wall's start panel.
// Kept free of data fetching and wallet state: the flow lives in useClaimFlow.

import type { ReactNode } from 'react'

import { Confetti } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { explorerAddressUrl, explorerTxUrl } from './graffiti.service'
import { HeroPanel } from './HeroPanel.pure'
import { useClaimMoo } from './useClaimMoo'
import { useConfettiBurst } from './useConfettiBurst'
import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

import type { ClaimFlow } from './useClaimFlow'

const SmallLink = styled(styledEl.PanelLink)`
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
`

export interface ClaimResultViewProps {
  claim: ClaimFlow
  connected: boolean
  /** Connected Solana account, where the tokens are sent. */
  account: string | undefined
  network: string
  onConnect: () => void
  onBack: () => void
}

type ClaimContentProps = Omit<ClaimResultViewProps, 'onBack'>

export function ClaimResultView({ onBack, ...props }: ClaimResultViewProps): ReactNode {
  return (
    <HeroPanel fillHeight>
      <styledEl.WallHeading>
        <Trans>GET {TOKEN_SYMBOL}</Trans>
      </styledEl.WallHeading>

      <ClaimContent {...props} />

      <styledEl.PanelActions>
        <styledEl.Button onClick={onBack}>
          <Trans>← back to the wall</Trans>
        </styledEl.Button>
      </styledEl.PanelActions>
    </HeroPanel>
  )
}

function ClaimAmount({ amount }: { amount: number | null }): ReactNode {
  return (
    <styledEl.CostValue>
      {amount ?? '…'} <styledEl.UnitLabel>{TOKEN_SYMBOL}</styledEl.UnitLabel>
    </styledEl.CostValue>
  )
}

function ClaimContent({ claim, connected, account: address, network, onConnect }: ClaimContentProps): ReactNode {
  switch (claim.screen) {
    case 'missing-code':
      return (
        <styledEl.PanelText $tone="muted">
          <Trans>
            No claim code found.
            <br />
            Scan a graffiti QR code or open a link like <code>/graffiti/claim?code=…</code>
          </Trans>
        </styledEl.PanelText>
      )

    case 'checking':
      return (
        <styledEl.PanelText $tone="muted">
          <Trans>Checking claim code…</Trans>
        </styledEl.PanelText>
      )

    case 'invalid-code':
      return (
        <styledEl.PanelText $tone="danger">
          <Trans>This claim code is invalid or has already been used.</Trans>
        </styledEl.PanelText>
      )

    case 'error':
      return (
        <>
          <styledEl.PanelText $tone="danger">
            <Trans>Claim failed</Trans>
          </styledEl.PanelText>
          <styledEl.PanelText $tone="muted">{claim.error}</styledEl.PanelText>
          <styledEl.Button onClick={claim.retry}>
            <Trans>try again</Trans>
          </styledEl.Button>
        </>
      )

    case 'success':
      return <ClaimSuccess amount={claim.amount} txSignature={claim.txSignature} network={network} />

    case 'ready':
    case 'claiming':
      return (
        <>
          <styledEl.PanelText>
            <Trans>This code is worth</Trans>
          </styledEl.PanelText>
          <ClaimAmount amount={claim.amount} />

          {connected ? (
            <styledEl.PrimaryButton disabled={claim.screen === 'claiming'} onClick={() => void claim.claim()}>
              {claim.screen === 'claiming' ? <Trans>CLAIMING…</Trans> : <Trans>CLAIM {TOKEN_SYMBOL}</Trans>}
            </styledEl.PrimaryButton>
          ) : (
            <styledEl.PrimaryButton onClick={onConnect}>
              <Trans>CONNECT SOLANA WALLET</Trans>
            </styledEl.PrimaryButton>
          )}

          {connected && address ? (
            <styledEl.PanelText $tone="muted">
              <Trans>
                to{' '}
                <SmallLink href={explorerAddressUrl(address, network)} target="_blank" rel="noopener noreferrer">
                  {address}
                </SmallLink>
              </Trans>
            </styledEl.PanelText>
          ) : (
            <styledEl.PanelText $tone="muted">
              <Trans>tokens are sent straight to your wallet</Trans>
            </styledEl.PanelText>
          )}
        </>
      )
  }
}

function ClaimSuccess({
  amount,
  txSignature,
  network,
}: {
  amount: number | null
  txSignature: string | null
  network: string
}): ReactNode {
  // Only mounted once a claim has settled, so mounting is the event.
  const bursting = useConfettiBurst()

  useClaimMoo()

  return (
    <>
      <Confetti start={bursting} />
      <styledEl.PanelText $tone="success">
        <Trans>CLAIMED!</Trans>
      </styledEl.PanelText>
      <ClaimAmount amount={amount} />

      {txSignature && (
        <SmallLink href={explorerTxUrl(txSignature, network)} target="_blank" rel="noopener noreferrer">
          <Trans>view transaction ↗</Trans>
        </SmallLink>
      )}
    </>
  )
}
