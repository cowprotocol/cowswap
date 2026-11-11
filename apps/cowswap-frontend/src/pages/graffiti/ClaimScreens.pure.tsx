// Presentational screens for the claim page. Kept free of data fetching and
// wallet state so the page component stays small enough to read.

import type { ReactNode } from 'react'

import { Confetti } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { explorerTxUrl } from './graffiti.service'
import { useConfettiBurst } from './useConfettiBurst'
import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

const Card = styled(styledEl.Panel)`
  max-width: 420px;
  width: 100%;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`

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

const BigEmoji = styled.p`
  margin: 0;
  font-size: 54px;
`

const Note = styled.p<{ $tone?: 'muted' | 'danger' | 'success' }>`
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ $tone }) =>
    $tone === 'danger'
      ? styledEl.wallColors.dangerSoft
      : $tone === 'success'
        ? styledEl.wallColors.neon
        : styledEl.wallColors.textMuted};
  font-weight: ${({ $tone }) => ($tone === 'success' ? 700 : 400)};
`

const ExplorerLink = styled.a`
  color: ${styledEl.wallColors.neonAlt};
  text-decoration: none;
  word-break: break-all;
  font-size: 12px;
`

const WallLink = styled(Link)`
  color: ${styledEl.wallColors.neonAlt};
  text-decoration: none;
  font-size: 12px;
`

export interface ErrorScreenProps {
  error: string | null
  onRetry: () => void
}

export interface ReadyScreenProps {
  amount: number | null
  connected: boolean
  claiming: boolean
  shortAddress: string
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
    <Card>
      <BigEmoji>⏳</BigEmoji>
      <Note>
        <Trans>Checking claim code…</Trans>
      </Note>
    </Card>
  )
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps): ReactNode {
  return (
    <Card>
      <BigEmoji>💥</BigEmoji>
      <Note $tone="danger">
        <Trans>Claim failed</Trans>
      </Note>
      <Note>{error}</Note>
      <styledEl.Button onClick={onRetry}>
        <Trans>try again</Trans>
      </styledEl.Button>
    </Card>
  )
}

export function InvalidCodeScreen(): ReactNode {
  return (
    <Card>
      <BigEmoji>🚫</BigEmoji>
      <Note $tone="danger">
        <Trans>This claim code is invalid or has already been used.</Trans>
      </Note>
    </Card>
  )
}

export function MissingCodeScreen(): ReactNode {
  return (
    <Card>
      <BigEmoji>❓</BigEmoji>
      <Note>
        <Trans>
          No claim code found.
          <br />
          Scan a graffiti QR code or open a link like <code>/graffiti/claim?code=…</code>
        </Trans>
      </Note>
    </Card>
  )
}

export function ReadyScreen({
  amount,
  connected,
  claiming,
  shortAddress,
  onConnect,
  onClaim,
}: ReadyScreenProps): ReactNode {
  return (
    <Card>
      <Note>
        <Trans>This code is worth</Trans>
      </Note>
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

      <Note>
        {connected ? <Trans>to {shortAddress}</Trans> : <Trans>tokens are sent straight to your wallet</Trans>}
      </Note>
    </Card>
  )
}

export function SuccessScreen({ amount, balance, txSignature, network }: SuccessScreenProps): ReactNode {
  // This screen is only mounted once a claim has settled, so mounting is the event.
  const bursting = useConfettiBurst()

  return (
    <Card>
      <Confetti start={bursting} />
      <BigEmoji>🎨</BigEmoji>
      <Note $tone="success">
        <Trans>CLAIMED!</Trans>
      </Note>
      <ClaimAmount amount={amount} />

      {balance !== null && (
        <Note>
          <Trans>
            wallet balance: {balance} {TOKEN_SYMBOL}
          </Trans>
        </Note>
      )}

      {txSignature && (
        <ExplorerLink href={explorerTxUrl(txSignature, network)} target="_blank" rel="noopener noreferrer">
          <Trans>view transaction ↗</Trans>
        </ExplorerLink>
      )}

      <WallLink to="/graffiti">
        <Trans>→ go paint the wall</Trans>
      </WallLink>
    </Card>
  )
}

function ClaimAmount({ amount }: { amount: number | null }): ReactNode {
  return (
    <Amount>
      {amount ?? '…'} <Unit>{TOKEN_SYMBOL}</Unit>
    </Amount>
  )
}
