import { useCallback, useEffect, useState } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'

import { useMatch, useSearchParams } from 'react-router'

import { Routes } from 'common/constants/routes'

import { getClaimInfo, postClaim } from './graffiti.service'

export interface ClaimFlow {
  screen: ClaimScreen
  amount: number | null
  error: string | null
  txSignature: string | null
  claim: () => Promise<void>
  retry: () => void
}

export type ClaimScreen = 'checking' | 'invalid-code' | 'missing-code' | 'ready' | 'claiming' | 'success' | 'error'

type ClaimOutcome = 'settled' | 'processing' | 'unknown'

const PROCESSING_MESSAGE =
  'Your claim is still being confirmed on-chain. Check your wallet in a minute — do not claim again, the code is already spent.'

/**
 * The claim a `/graffiti/claim?code=<id>` link opened, redeemed over the wall
 * rather than on a page of its own. Null on the plain wall route.
 */
export function useClaimFlow(solanaAccount: string | undefined): ClaimFlow | null {
  const code = useClaimCode()

  const [screen, setScreen] = useState<ClaimScreen>('checking')
  const [amount, setAmount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  useEffect(() => {
    if (code === null) return

    setAmount(null)
    setError(null)
    setTxSignature(null)

    if (!code) {
      setScreen('missing-code')
      return
    }

    setScreen('checking')

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

        setError(normalizeError(err).message)
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
      // The transfer can land after the request gives up, and a code is single-use: if it is
      // spent, this claim is what spent it, so report the tokens rather than a failure.
      const outcome = await claimOutcome(code)

      if (outcome === 'settled') {
        setTxSignature(null)
        setScreen('success')
        return
      }

      setError(claimErrorMessage(outcome, err))
      setScreen('error')
    }
  }, [code, solanaAccount])

  const retry = useCallback(() => setScreen(amount !== null ? 'ready' : 'invalid-code'), [amount])

  if (code === null) return null

  return { screen, amount, error, txSignature, claim, retry }
}

/** A transfer still in flight must not be reported with the failure of the request that gave up on it. */
function claimErrorMessage(outcome: ClaimOutcome, err: unknown): string {
  if (outcome === 'processing') return PROCESSING_MESSAGE

  return normalizeError(err).message
}

/** A spent code with nothing in flight was spent by this claim, so the treasury transfer landed. */
async function claimOutcome(code: string): Promise<ClaimOutcome> {
  try {
    const info = await getClaimInfo(code)

    if (info.processing) return 'processing'

    return info.valid ? 'unknown' : 'settled'
  } catch {
    return 'unknown'
  }
}

/** The code on the claim route, empty when the link carries none; null anywhere else. */
function useClaimCode(): string | null {
  const onClaimRoute = useMatch(Routes.GRAFFITI_CLAIM) !== null
  const [searchParams] = useSearchParams()

  if (!onClaimRoute) return null

  return searchParams.get('code')?.trim() || ''
}
