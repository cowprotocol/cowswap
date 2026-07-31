import { useEffect, useState } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection, PublicKey } from '@solana/web3.js'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

import { getSolanaUnwrapPreview } from '../services/wrapNativeSolana/getSolanaUnwrapPreview'
import { getSolanaWrapPreview } from '../services/wrapNativeSolana/getSolanaWrapPreview'

type WrapDirection = 'wrap' | 'unwrap' | null

/**
 * The amount the trade form's output field should show for a Solana wrap/unwrap trade, rather than a
 * plain 1:1 mirror of the input.
 *
 * Neither direction is a plain mirror: wrapping deducts a one-time rent-exempt deposit from the WSOL
 * received when the associated token account doesn't exist yet (see `getSolanaWrapPreview`), and
 * unwrapping the *entire* WSOL balance reclaims that same reserve on top of the unwrapped amount (see
 * `getSolanaUnwrapPreview`). Both need a short RPC round-trip to preview, so this returns `undefined`
 * on every non-Solana chain, and while that preview is loading or fails, so the caller can fall back to
 * a plain mirror.
 */
export function useSolanaWrapReceiveAmount(): CurrencyAmount<Currency> | undefined {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
  const inputCurrencyAmount = useDerivedTradeState()?.inputCurrencyAmount ?? undefined

  const direction = getSolanaWrapDirection(chainId, isWrapOrUnwrap, inputCurrencyAmount)
  const lamports = direction ? inputCurrencyAmount?.quotient : undefined

  return usePreviewReceiveAmount(direction, connection, account, lamports)
}

function getSolanaWrapDirection(
  chainId: SupportedChainId,
  isWrapOrUnwrap: boolean,
  inputCurrencyAmount: CurrencyAmount<Currency> | undefined,
): WrapDirection {
  if (!isSolanaChain(chainId) || !isWrapOrUnwrap || !inputCurrencyAmount) return null

  return getIsNativeToken(inputCurrencyAmount.currency) ? 'wrap' : 'unwrap'
}

/**
 * Fetches the wrap/unwrap preview whenever the direction or amount changes, cancelling a stale request
 * if a newer one starts before it resolves.
 */
function usePreviewReceiveAmount(
  direction: WrapDirection,
  connection: Connection | undefined,
  account: string | undefined,
  lamports: bigint | undefined,
): CurrencyAmount<Currency> | undefined {
  const [receiveAmount, setReceiveAmount] = useState<CurrencyAmount<Currency>>()
  const canPreview = !!direction && !!account && !!connection && !!lamports && lamports > 0n

  useEffect(() => {
    if (!canPreview || !direction || !account || !connection || !lamports) {
      setReceiveAmount(undefined)
      return
    }

    let cancelled = false
    const getPreview = direction === 'wrap' ? getSolanaWrapPreview : getSolanaUnwrapPreview

    getPreview(connection, new PublicKey(account), lamports)
      .then((preview) => {
        if (!cancelled) setReceiveAmount(preview.receiveAmount)
      })
      .catch((error) => {
        console.error(`Could not preview the Solana ${direction} amount`, error)
        if (!cancelled) setReceiveAmount(undefined)
      })

    return () => {
      cancelled = true
    }
  }, [canPreview, direction, account, connection, lamports])

  return receiveAmount
}
