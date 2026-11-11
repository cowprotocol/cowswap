// Presentational screens for the claim page. Kept free of data fetching and
// wallet state so the page component stays small enough to read.

import type { ReactNode } from 'react'

import { Confetti } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { Routes } from 'common/constants/routes'

import { explorerAddressUrl, explorerTxUrl } from './graffiti.service'
import { HeroPanel } from './HeroPanel.pure'
import { useClaimMoo } from './useClaimMoo'
import { useConfettiBurst } from './useConfettiBurst'
import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

const Amount = styled.p`
  margin: 0;
  font-size: 44px;
  font-weight: 700;
  color: ${styledEl.wallColors.neon};
  text-shadow: ${styledEl.neonShadow};
`

const Unit = styled.span`
  font-size: 16px;
  color: ${styledEl.wallColors.textMuted};
`

const SmallLink = styled(styledEl.PanelLink)`
  font-size: 12px;
  line-height: 1.5;
`

export interface ErrorScreenProps {
  error: string | null
  onRetry: () => void
}

export interface ReadyScreenProps {
  amount: number | null
  connected: boolean
  claiming: boolean
  address: string
  network: string
  onConnect: () => void
  onClaim: () => void
}

export interface SuccessScreenProps {
  amount: number | null
  balance: number | null
  txSignature: string | null
  network: string
}

export function CheckingScreen(): ReactNode {
  return (
    <ClaimCard>
      <styledEl.BigEmoji $size={54}>⏳</styledEl.BigEmoji>
      <styledEl.PanelText $tone="muted">
        <Trans>Checking claim code…</Trans>
      </styledEl.PanelText>
    </ClaimCard>
  )
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps): ReactNode {
  return (
    <ClaimCard>
      <styledEl.BigEmoji $size={54}>💥</styledEl.BigEmoji>
      <styledEl.PanelText $tone="danger">
        <Trans>Claim failed</Trans>
      </styledEl.PanelText>
      <styledEl.PanelText $tone="muted">{error}</styledEl.PanelText>
      <styledEl.Button onClick={onRetry}>
        <Trans>try again</Trans>
      </styledEl.Button>
    </ClaimCard>
  )
}

export function InvalidCodeScreen(): ReactNode {
  return (
    <ClaimCard>
      <styledEl.BigEmoji $size={54}>🚫</styledEl.BigEmoji>
      <styledEl.PanelText $tone="danger">
        <Trans>This claim code is invalid or has already been used.</Trans>
      </styledEl.PanelText>
    </ClaimCard>
  )
}

export function MissingCodeScreen(): ReactNode {
  return (
    <ClaimCard>
      <styledEl.BigEmoji $size={54}>❓</styledEl.BigEmoji>
      <styledEl.PanelText $tone="muted">
        <Trans>
          No claim code found.
          <br />
          Scan a graffiti QR code or open a link like <code>/graffiti/claim?code=…</code>
        </Trans>
      </styledEl.PanelText>
    </ClaimCard>
  )
}

export function ReadyScreen({
  amount,
  connected,
  claiming,
  address,
  network,
  onConnect,
  onClaim,
}: ReadyScreenProps): ReactNode {
  return (
    <ClaimCard>
      <styledEl.PanelText $tone="muted">
        <Trans>This code is worth</Trans>
      </styledEl.PanelText>
      <ClaimAmount amount={amount} />

      {connected ? (
        <styledEl.PrimaryButton disabled={claiming} onClick={onClaim}>
          {claiming ? <Trans>CLAIMING…</Trans> : <Trans>CLAIM {TOKEN_SYMBOL}</Trans>}
        </styledEl.PrimaryButton>
      ) : (
        <styledEl.PrimaryButton onClick={onConnect}>
          <Trans>CONNECT SOLANA WALLET</Trans>
        </styledEl.PrimaryButton>
      )}

      {connected ? (
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
    </ClaimCard>
  )
}

export function SuccessScreen({ amount, balance, txSignature, network }: SuccessScreenProps): ReactNode {
  // This screen is only mounted once a claim has settled, so mounting is the event.
  const bursting = useConfettiBurst()

  useClaimMoo()

  return (
    <ClaimCard>
      <Confetti start={bursting} />
      <styledEl.BigEmoji $size={54}>🎨</styledEl.BigEmoji>
      <styledEl.PanelText $tone="success">
        <Trans>CLAIMED!</Trans>
      </styledEl.PanelText>
      <ClaimAmount amount={amount} />

      {balance !== null && (
        <styledEl.PanelText $tone="muted">
          <Trans>
            wallet balance: {balance} {TOKEN_SYMBOL}
          </Trans>
        </styledEl.PanelText>
      )}

      {txSignature && (
        <SmallLink href={explorerTxUrl(txSignature, network)} target="_blank" rel="noopener noreferrer">
          <Trans>view transaction ↗</Trans>
        </SmallLink>
      )}
    </ClaimCard>
  )
}

function ClaimAmount({ amount }: { amount: number | null }): ReactNode {
  return (
    <Amount>
      {amount ?? '…'} <Unit>{TOKEN_SYMBOL}</Unit>
    </Amount>
  )
}

/** The wall's panel shape, so the claim page matches the wall's own modals. */
function ClaimCard({ children }: { children: ReactNode }): ReactNode {
  return (
    <styledEl.ModalPanel>
      <HeroPanel centered>
        {children}
        <styledEl.PanelActions>
          <styledEl.ButtonLink to={Routes.GRAFFITI}>
            <Trans>← back to the wall</Trans>
          </styledEl.ButtonLink>
        </styledEl.PanelActions>
      </HeroPanel>
    </styledEl.ModalPanel>
  )
}
