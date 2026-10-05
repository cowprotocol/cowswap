import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import useSWR from 'swr'

import {
  getSolanaTradeOverhead,
  planSolanaTradeFundedAccounts,
  useDerivedTradeState,
  useIsWrapOrUnwrap,
} from 'modules/trade'
import type { SolanaFundedAccount } from 'modules/trade'
import { isSolanaQuoteAndPost, useTradeQuote } from 'modules/tradeQuote'

import { TradeType } from 'common/modules/tradeNavigation'

/**
 * Lamports the current trade's transaction needs on top of the sell amount: rent for every account
 * the bundle creates, the signature fee, and the fee payer's own rent-exempt reserve.
 *
 * `null` while unknown (no quote yet, RPC pending/failed) or when the owner won't pay it at all —
 * non-Solana chains and sponsored trades, where the quote's funder covers the fee and every rent.
 */
export function useSolanaTradeOverhead(): bigint | null {
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
  const { quote } = useTradeQuote()
  const { isSolanaSponsoredOrdersEnabled } = useFeatureFlags()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const derivedState = useDerivedTradeState()
  const inputCurrency = derivedState?.inputCurrency
  const tradeType = derivedState?.tradeType

  const isNativeSell = Boolean(inputCurrency && getIsNativeToken(inputCurrency))
  const solanaQuote = isSolanaQuoteAndPost(quote) ? quote.solanaQuote : null

  const isSponsored = getIsSponsoredTrade(Boolean(isSolanaSponsoredOrdersEnabled), tradeType, solanaQuote)

  const fundedAccounts = useMemo(() => {
    if (!isSolanaChain(chainId) || !account) return null

    // A wrap/unwrap is a plain owner-paid transaction — never sponsored, no quote involved.
    if (isWrapUnwrap) return []

    if (!solanaQuote || isSponsored) return null

    return planSolanaTradeFundedAccounts({ owner: new PublicKey(account), quote: solanaQuote, isNativeSell })
  }, [chainId, account, solanaQuote, isNativeSell, isSponsored, isWrapUnwrap])

  // Keyed on the accounts rather than the typed amount: rent doesn't depend on how much is being sold,
  // so typing must not refetch. The amount only enters the callers' comparisons.
  const { data: overhead } = useSWR(
    connection && fundedAccounts ? [toFundedAccountsKey(fundedAccounts), 'solanaTradeOverhead'] : null,
    () => (connection && fundedAccounts ? getSolanaTradeOverhead(connection, fundedAccounts) : null),
  )

  return overhead ?? null
}

// Mirrors `solanaFlow`'s sponsor pick: a sponsored order is rented and fee-paid by the quote's funder,
// so the owner needs no SOL beyond the sell amount — pricing the overhead anyway would block a trade
// that can in fact go through. Limit orders never go through the sponsored path.
function getIsSponsoredTrade(
  isSolanaSponsoredOrdersEnabled: boolean,
  tradeType: TradeType | null | undefined,
  solanaQuote: { funder?: PublicKey } | null,
): boolean {
  return Boolean(isSolanaSponsoredOrdersEnabled && tradeType !== TradeType.LIMIT_ORDER && solanaQuote?.funder)
}

function toFundedAccountsKey(fundedAccounts: SolanaFundedAccount[]): string {
  return fundedAccounts
    .map(({ address, size }) => {
      const sizeKey = typeof size === 'number' ? size : `${size.mint.toBase58()}/${size.tokenProgramId.toBase58()}`

      return `${address?.toBase58() ?? ''}:${sizeKey}`
    })
    .join('|')
}
