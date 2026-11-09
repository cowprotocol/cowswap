// Graffiti Wall — claim page (/graffiti/claim?code=<id>).
//
// QR codes encode this URL; claiming transfers MOOOXEL tokens from the treasury
// to the connected wallet, one use per code. See docs/graffiti/SPEC.md.

import { ReactNode, useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import { Link, useSearchParams } from 'react-router'

import { useOpenWalletConnectionModal, useSolanaAccount } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'

import { getClaimInfo, getInfo, postClaim } from './api'

type Screen = 'checking' | 'invalid-code' | 'missing-code' | 'ready' | 'claiming' | 'success' | 'error'

const neonShadow = '0 0 12px rgba(0,255,163,0.55)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
    background: 'radial-gradient(900px 600px at 50% -10%, #131324 0%, #0a0a12 55%, #060609 100%)',
    color: '#e8e8f0',
    fontFamily: "'IBM Plex Mono', 'Fira Mono', ui-monospace, monospace",
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#00ffa3',
    textShadow: neonShadow,
    margin: 0,
  },
  card: {
    border: '1px solid #2a2a40',
    borderRadius: 14,
    background: 'rgba(12,12,20,0.9)',
    padding: '28px 32px',
    maxWidth: 420,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  amount: {
    fontSize: 44,
    fontWeight: 700,
    color: '#00ffa3',
    textShadow: neonShadow,
    margin: 0,
  },
  muted: {
    color: '#8a8aa3',
    fontSize: 13,
    margin: 0,
    lineHeight: 1.6,
  },
  bigEmoji: { fontSize: 54, margin: 0 },
  button: {
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #00ffa3, #00d0ff)',
    color: '#061310',
    fontWeight: 700,
    padding: '14px 20px',
    fontFamily: 'inherit',
    fontSize: 15,
    letterSpacing: 1,
    cursor: 'pointer',
    boxShadow: neonShadow,
    width: '100%',
  },
  ghostButton: {
    borderRadius: 8,
    border: '1px solid #2a2a40',
    background: 'transparent',
    color: '#e8e8f0',
    padding: '10px 16px',
    fontFamily: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
    width: '100%',
  },
  link: {
    color: '#00d0ff',
    textDecoration: 'none',
    wordBreak: 'break-all',
    fontSize: 12,
  },
}

export default function GraffitiClaimPage(): ReactNode {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')?.trim() || ''

  const solanaAccount = useSolanaAccount()
  const openWalletModal = useOpenWalletConnectionModal()
  const { connection } = useAppKitConnection()

  const [screen, setScreen] = useState<Screen>(code ? 'checking' : 'missing-code')
  const [amount, setAmount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    if (!code) return

    let disposed = false

    getClaimInfo(code)
      .then((res) => {
        if (disposed) return

        if (res.valid && res.amount > 0) {
          setAmount(res.amount)
          setScreen('ready')
        } else {
          setScreen('invalid-code')
        }
      })
      .catch((err: unknown) => {
        if (disposed) return

        setError(err instanceof Error ? err.message : String(err))
        setScreen('error')
      })

    return () => {
      disposed = true
    }
  }, [code])

  /** Best-effort MOOOXEL balance of the connected wallet (0-decimal token). */
  const refreshBalance = useCallback(async () => {
    if (!connection || !solanaAccount) return

    try {
      const { mint } = await getInfo()
      const owner = new PublicKey(solanaAccount)
      const res = await connection.getParsedTokenAccountsByOwner(owner, { mint: new PublicKey(mint) })

      let total = 0

      for (const { account } of res.value) {
        const parsed = (account.data as { parsed?: { info?: { tokenAmount?: { amount?: string } } } }).parsed

        total += Number(parsed?.info?.tokenAmount?.amount || 0)
      }

      setBalance(total)
    } catch {
      setBalance(null)
    }
  }, [connection, solanaAccount])

  useEffect(() => {
    if (screen === 'success') refreshBalance()
  }, [screen, refreshBalance])

  const claim = useCallback(async () => {
    if (!code || !solanaAccount) return

    setScreen('claiming')
    setError(null)

    try {
      const res = await postClaim({ code, walletPubkey: solanaAccount })

      setTxSignature(res.txSignature)
      setAmount(res.amount)
      setScreen('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      setScreen('error')
    }
  }, [code, solanaAccount])

  const connected = Boolean(solanaAccount)

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🖍 Graffiti Wall</h1>

      {screen === 'missing-code' && (
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
      )}

      {screen === 'checking' && (
        <div style={styles.card}>
          <p style={styles.bigEmoji}>⏳</p>
          <p style={styles.muted}>Checking claim code…</p>
        </div>
      )}

      {screen === 'invalid-code' && (
        <div style={styles.card}>
          <p style={styles.bigEmoji}>🚫</p>
          <p style={{ ...styles.muted, color: '#ff5c8a' }}>
            This claim code is invalid or has already been used.
          </p>
        </div>
      )}

      {(screen === 'ready' || screen === 'claiming') && (
        <div style={styles.card}>
          <p style={styles.muted}>This code is worth</p>
          <p style={styles.amount}>
            {amount ?? '…'} <span style={{ fontSize: 16, color: '#8a8aa3' }}>MOOOXEL</span>
          </p>

          {!connected ? (
            <button style={styles.button} onClick={openWalletModal}>
              CONNECT SOLANA WALLET
            </button>
          ) : (
            <button style={{ ...styles.button, opacity: screen === 'claiming' ? 0.5 : 1 }} disabled={screen === 'claiming'} onClick={claim}>
              {screen === 'claiming' ? 'CLAIMING…' : 'CLAIM MOOOXEL'}
            </button>
          )}

          <p style={styles.muted}>
            {connected
              ? `to ${solanaAccount!.slice(0, 4)}…${solanaAccount!.slice(-4)}`
              : 'tokens are sent straight to your wallet'}
          </p>
        </div>
      )}

      {screen === 'success' && (
        <div style={styles.card}>
          <p style={styles.bigEmoji}>🎨</p>
          <p style={{ ...styles.muted, color: '#00ffa3', fontWeight: 700 }}>CLAIMED!</p>
          <p style={styles.amount}>
            {amount ?? '…'} <span style={{ fontSize: 16, color: '#8a8aa3' }}>MOOOXEL</span>
          </p>
          {balance !== null && (
            <p style={styles.muted}>
              wallet balance: <strong style={{ color: '#00ffa3' }}>{balance} MOOOXEL</strong>
            </p>
          )}
          {txSignature && (
            <a
              style={styles.link}
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
            >
              view transaction ↗
            </a>
          )}
          <Link style={styles.link} to="/graffiti">
            → go paint the wall
          </Link>
        </div>
      )}

      {screen === 'error' && (
        <div style={styles.card}>
          <p style={styles.bigEmoji}>💥</p>
          <p style={{ ...styles.muted, color: '#ff5c8a' }}>Claim failed</p>
          <p style={styles.muted}>{error}</p>
          <button style={styles.ghostButton} onClick={() => setScreen(amount !== null ? 'ready' : 'invalid-code')}>
            try again
          </button>
        </div>
      )}
    </div>
  )
}
