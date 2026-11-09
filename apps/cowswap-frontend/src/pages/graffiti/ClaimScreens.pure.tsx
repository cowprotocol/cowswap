// Presentational screens for the claim page. Kept free of data fetching and
// wallet state so the page component stays small enough to read.

import type { ReactNode } from 'react'

import { Link } from 'react-router'

import { styles } from './Claim.styled'
import { explorerTxUrl } from './graffiti.service'

const TOKEN_SYMBOL = 'MOOOXEL'

const unitStyle = { fontSize: 16, color: '#8a8aa3' }

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
    <div style={styles.card}>
      <p style={styles.bigEmoji}>⏳</p>
      <p style={styles.muted}>Checking claim code…</p>
    </div>
  )
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps): ReactNode {
  return (
    <div style={styles.card}>
      <p style={styles.bigEmoji}>💥</p>
      <p style={{ ...styles.muted, color: '#ff5c8a' }}>Claim failed</p>
      <p style={styles.muted}>{error}</p>
      <button style={styles.ghostButton} onClick={onRetry} type="button">
        try again
      </button>
    </div>
  )
}

export function InvalidCodeScreen(): ReactNode {
  return (
    <div style={styles.card}>
      <p style={styles.bigEmoji}>🚫</p>
      <p style={{ ...styles.muted, color: '#ff5c8a' }}>This claim code is invalid or has already been used.</p>
    </div>
  )
}

export function MissingCodeScreen(): ReactNode {
  return (
    <div style={styles.card}>
      <p style={styles.bigEmoji}>❓</p>
      <p style={styles.muted}>
        No claim code found.
        <br />
        Scan a graffiti QR code or open a link like
        <br />
        <code>/graffiti/claim?code=…</code>
      </p>
    </div>
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
    <div style={styles.card}>
      <p style={styles.muted}>This code is worth</p>
      <Amount amount={amount} />

      {connected ? (
        <button
          style={{ ...styles.button, opacity: claiming ? 0.5 : 1 }}
          disabled={claiming}
          onClick={onClaim}
          type="button"
        >
          {claiming ? 'CLAIMING…' : `CLAIM ${TOKEN_SYMBOL}`}
        </button>
      ) : (
        <button style={styles.button} onClick={onConnect} type="button">
          CONNECT SOLANA WALLET
        </button>
      )}

      <p style={styles.muted}>{connected ? `to ${shortAddress}` : 'tokens are sent straight to your wallet'}</p>
    </div>
  )
}

export function SuccessScreen({ amount, balance, txSignature, network }: SuccessScreenProps): ReactNode {
  return (
    <div style={styles.card}>
      <p style={styles.bigEmoji}>🎨</p>
      <p style={{ ...styles.muted, color: '#00ffa3', fontWeight: 700 }}>CLAIMED!</p>
      <Amount amount={amount} />

      {balance !== null && (
        <p style={styles.muted}>
          wallet balance:{' '}
          <strong style={{ color: '#00ffa3' }}>
            {balance} {TOKEN_SYMBOL}
          </strong>
        </p>
      )}

      {txSignature && (
        <a style={styles.link} href={explorerTxUrl(txSignature, network)} target="_blank" rel="noopener noreferrer">
          view transaction ↗
        </a>
      )}

      <Link style={styles.link} to="/graffiti">
        → go paint the wall
      </Link>
    </div>
  )
}

function Amount({ amount }: { amount: number | null }): ReactNode {
  return (
    <p style={styles.amount}>
      {amount ?? '…'} <span style={unitStyle}>{TOKEN_SYMBOL}</span>
    </p>
  )
}
