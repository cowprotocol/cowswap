import { useMemo } from 'react'

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
  useIsSolanaSponsoredTrade,
  useIsWrapOrUnwrap,
} from 'modules/trade'
import type { SolanaFundedAccount, SolanaTradeOverhead } from 'modules/trade'
import { isSolanaQuoteAndPost, useTradeQuote } from 'modules/tradeQuote'

interface OverheadRequest {
  fundedAccounts: SolanaFundedAccount[]
  ownerPaysFees: boolean
}

/**
 * Lamports the trade needs on top of the sell amount: rents + fees + the wallet's rent-exempt reserve
 * (`required` gates the trade, `maxReserve` adds priority-fee headroom for the MAX button). On a
 * sponsored trade only the wallet reserve remains, and only for a native sell (the wrap transfer
 * still debits the owner). `null` while unknown or when nothing debits the wallet at all.
 */
export function useSolanaTradeOverhead(): SolanaTradeOverhead | null {
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
  const { quote } = useTradeQuote()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const derivedState = useDerivedTradeState()
  const inputCurrency = derivedState?.inputCurrency

  const isNativeSell = Boolean(inputCurrency && getIsNativeToken(inputCurrency))
  const solanaQuote = isSolanaQuoteAndPost(quote) ? quote.solanaQuote : null

  const isSponsored = useIsSolanaSponsoredTrade()

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

function toFundedAccountsKey(fundedAccounts: SolanaFundedAccount[]): string {
  return fundedAccounts
    .map(({ address, size }) => {
      const sizeKey = typeof size === 'number' ? size : `${size.mint.toBase58()}/${size.tokenProgramId.toBase58()}`

      return `${address?.toBase58() ?? ''}:${sizeKey}`
    })
    .join('|')
}
