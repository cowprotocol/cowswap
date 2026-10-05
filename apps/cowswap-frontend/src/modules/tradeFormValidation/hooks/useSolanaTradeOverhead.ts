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

interface OverheadRequest {
  fundedAccounts: SolanaFundedAccount[]
  ownerPaysFees: boolean
}

/**
 * Lamports the trade needs on top of the sell amount: rents + fees + the wallet's rent-exempt reserve.
 * On a sponsored trade only the wallet reserve remains, and only for a native sell (the wrap transfer
 * still debits the owner). `null` while unknown or when nothing debits the wallet at all.
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

  const request = useMemo<OverheadRequest | null>(() => {
    if (!isSolanaChain(chainId) || !account) return null

    // A wrap/unwrap is a plain owner-paid transaction — never sponsored, no quote involved.
    if (isWrapUnwrap) return { fundedAccounts: [], ownerPaysFees: true }

    if (!solanaQuote) return null

    if (isSponsored) {
      return isNativeSell ? { fundedAccounts: [], ownerPaysFees: false } : null
    }

    return {
      fundedAccounts: planSolanaTradeFundedAccounts({
        owner: new PublicKey(account),
        quote: solanaQuote,
        isNativeSell,
      }),
      ownerPaysFees: true,
    }
  }, [chainId, account, solanaQuote, isNativeSell, isSponsored, isWrapUnwrap])

  // Keyed on the accounts rather than the typed amount: rent doesn't depend on how much is being sold,
  // so typing must not refetch. The amount only enters the callers' comparisons. `rpcEndpoint` keys the
  // cache to the active network — rent minimums are a cluster property, and the account lookups below
  // resolve against whatever cluster the connection points at — matching `useSolanaNativeBalance`.
  const { data: overhead } = useSWR(
    connection && request
      ? [
          toFundedAccountsKey(request.fundedAccounts),
          request.ownerPaysFees,
          connection.rpcEndpoint,
          'solanaTradeOverhead',
        ]
      : null,
    () =>
      connection && request
        ? getSolanaTradeOverhead(connection, request.fundedAccounts, { ownerPaysFees: request.ownerPaysFees })
        : null,
  )

  return overhead ?? null
}

// Mirrors `solanaFlow`'s sponsor pick: a sponsored order is rented and fee-paid by the quote's funder,
// so the owner pays nothing beyond the sell amount — only the wallet's own rent-exempt reserve still
// applies, and only when the sell debits it (a native sell). Limit orders never go through this path.
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
