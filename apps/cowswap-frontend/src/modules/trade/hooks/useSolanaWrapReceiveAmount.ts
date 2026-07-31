import { useEffect, useState } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection, PublicKey } from '@solana/web3.js'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

import { getSolanaUnwrapPreview } from '../services/wrapNativeSolana/getSolanaUnwrapPreview'

type WrapDirection = 'wrap' | 'unwrap' | null

/**
 * The amount the trade form's output field should show for a Solana wrap/unwrap trade, rather than a
 * plain 1:1 mirror of the input.
 *
 * Wrapping is always exactly 1:1 (the WSOL balance mirrors the deposited lamports), so that case
 * resolves synchronously. Unwrapping the *entire* WSOL balance also reclaims the account's rent-exempt
 * reserve — see `solanaWrapUnwrapCallback` — which needs a short RPC round-trip to preview. This
 * returns `undefined` on every non-Solana chain, and while that preview is loading or fails, so the
 * caller can fall back to a plain mirror.
 */
export function useSolanaWrapReceiveAmount(): CurrencyAmount<Currency> | undefined {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
  const inputCurrencyAmount = useDerivedTradeState()?.inputCurrencyAmount ?? undefined

  const direction = getSolanaWrapDirection(chainId, isWrapOrUnwrap, inputCurrencyAmount)
  const lamports = direction === 'unwrap' ? inputCurrencyAmount?.quotient : undefined

  const unwrapReceiveAmount = useUnwrapReceiveAmount(connection, account, lamports)

  if (direction === 'wrap' && inputCurrencyAmount) {
    return CurrencyAmount.fromRawAmount(
      WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA],
      inputCurrencyAmount.quotient,
    )
  }

  if (direction === 'unwrap') {
    return unwrapReceiveAmount
  }

  return undefined
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
 * Fetches the unwrap preview whenever the amount to unwrap changes, cancelling a stale request if a
 * newer one starts before it resolves.
 */
function useUnwrapReceiveAmount(
  connection: Connection | undefined,
  account: string | undefined,
  lamports: bigint | undefined,
): CurrencyAmount<Currency> | undefined {
  const [receiveAmount, setReceiveAmount] = useState<CurrencyAmount<Currency>>()
  const canPreview = !!account && !!connection && !!lamports && lamports > 0n

  useEffect(() => {
    if (!canPreview || !account || !connection || !lamports) {
      setReceiveAmount(undefined)
      return
    }

    let cancelled = false

    getSolanaUnwrapPreview(connection, new PublicKey(account), lamports)
      .then((preview) => {
        if (!cancelled) setReceiveAmount(preview.receiveAmount)
      })
      .catch((error) => {
        console.error('Could not preview the Solana unwrap amount', error)
        if (!cancelled) setReceiveAmount(undefined)
      })

    return () => {
      cancelled = true
    }
  }, [canPreview, account, connection, lamports])

  return receiveAmount
}
