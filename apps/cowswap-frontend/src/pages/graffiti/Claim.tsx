// Graffiti Wall — claim page (/graffiti/claim?code=<id>).
//
// QR codes encode this URL; claiming transfers MOOOXEL tokens from the treasury
// to the connected wallet, one use per code. See docs/graffiti/SPEC.md.

import { ReactNode, useCallback, useEffect, useState } from 'react'

import { useOpenWalletConnectionModal, useSolanaAccount } from '@cowprotocol/wallet'

import { useSearchParams } from 'react-router'

import { styles } from './Claim.styled'
import {
  CheckingScreen,
  ErrorScreen,
  InvalidCodeScreen,
  MissingCodeScreen,
  ReadyScreen,
  SuccessScreen,
} from './ClaimScreens.pure'
import { getClaimInfo, getInfo, postClaim, type CanvasInfo } from './graffiti.service'
import { useTokenBalance } from './useTokenBalance'

type Screen = 'checking' | 'invalid-code' | 'missing-code' | 'ready' | 'claiming' | 'success' | 'error'

export default function GraffitiClaimPage(): ReactNode {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')?.trim() || ''

  const solanaAccount = useSolanaAccount()
  const openWalletModal = useOpenWalletConnectionModal()

  const [screen, setScreen] = useState<Screen>(code ? 'checking' : 'missing-code')
  const [amount, setAmount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [info, setInfo] = useState<CanvasInfo | null>(null)

  const balance = useTokenBalance(solanaAccount ?? undefined, info?.mint, screen === 'success')

  useEffect(() => {
    let disposed = false

    getInfo()
      .then((res) => {
        if (!disposed) setInfo(res)
      })
      .catch(() => undefined)

    return () => {
      disposed = true
    }
  }, [])

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
  const shortAddress = solanaAccount ? `${solanaAccount.slice(0, 4)}…${solanaAccount.slice(-4)}` : ''

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🖍 Graffiti Wall</h1>

      {screen === 'missing-code' && <MissingCodeScreen />}
      {screen === 'checking' && <CheckingScreen />}
      {screen === 'invalid-code' && <InvalidCodeScreen />}

      {(screen === 'ready' || screen === 'claiming') && (
        <ReadyScreen
          amount={amount}
          connected={connected}
          claiming={screen === 'claiming'}
          shortAddress={shortAddress}
          onConnect={openWalletModal}
          onClaim={claim}
        />
      )}

      {screen === 'success' && (
        <SuccessScreen
          amount={amount}
          balance={balance}
          txSignature={txSignature}
          network={info?.network ?? 'devnet'}
        />
      )}

      {screen === 'error' && (
        <ErrorScreen error={error} onRetry={() => setScreen(amount !== null ? 'ready' : 'invalid-code')} />
      )}
    </div>
  )
}
