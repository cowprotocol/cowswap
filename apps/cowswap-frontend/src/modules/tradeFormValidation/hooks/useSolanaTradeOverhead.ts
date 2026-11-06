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
  getWrapFundedAccounts,
  planSolanaTradeFundedAccounts,
  useDerivedTradeState,
  useIsSolanaSponsoredTrade,
  useIsWrapOrUnwrap,
} from 'modules/trade'
import type { SolanaFundedAccount, SolanaTradeOverhead } from 'modules/trade'
import { isSolanaQuoteAndPost, useTradeQuote } from 'modules/tradeQuote'

export interface UseSolanaTradeOverheadOptions {
  /**
   * Prices the bundle as if nobody sponsored it — what placing the order costs in total, rather than
   * what the owner has to hold. Sponsoring moves most of that spend to the funder without changing
   * it, so the un-sponsored figure is also what the order costs to place either way.
   */
  ignoreSponsor?: boolean
}

interface OverheadRequest {
  fundedAccounts: SolanaFundedAccount[]
  ownerPaysFees: boolean
}

/**
 * Lamports the trade needs on top of the sell amount: rents + fees + the wallet's rent-exempt reserve
 * (`required` gates the trade, `maxReserve` adds priority-fee headroom for the MAX button). On a
 * sponsored trade only a native sell debits the owner at all, and then only for the wrap: the
 * transfer itself, and the rent for the WSOL account it opens. `null` while unknown or when nothing
 * debits the wallet at all.
 */
export function useSolanaTradeOverhead({
  ignoreSponsor = false,
}: UseSolanaTradeOverheadOptions = {}): SolanaTradeOverhead | null {
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
  const { quote } = useTradeQuote()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const derivedState = useDerivedTradeState()
  const inputCurrency = derivedState?.inputCurrency

  const isNativeSell = Boolean(inputCurrency && getIsNativeToken(inputCurrency))
  const solanaQuote = isSolanaQuoteAndPost(quote) ? quote.solanaQuote : null

  const isSponsoredTrade = useIsSolanaSponsoredTrade()
  const isSponsored = isSponsoredTrade && !ignoreSponsor
  const { isAtaCreationDisabled } = useFeatureFlags()

  const request = useMemo<OverheadRequest | null>(() => {
    if (!isSolanaChain(chainId) || !account) return null

    // A wrap/unwrap is a plain owner-paid transaction — never sponsored, no quote involved.
    if (isWrapUnwrap) return { fundedAccounts: [], ownerPaysFees: true }

    if (!solanaQuote) return null

    // The WSOL account a native sell opens is the owner's, so its rent is the owner's even here —
    // every other account the bundle creates is the sponsor's, as are the fees.
    if (isSponsored) {
      return isNativeSell
        ? { fundedAccounts: getWrapFundedAccounts(new PublicKey(account)), ownerPaysFees: false }
        : null
    }

    return {
      fundedAccounts: planSolanaTradeFundedAccounts({
        owner: new PublicKey(account),
        quote: solanaQuote,
        isNativeSell,
        isAtaCreationDisabled: Boolean(isAtaCreationDisabled),
      }),
      ownerPaysFees: true,
    }
  }, [chainId, account, solanaQuote, isNativeSell, isSponsored, isWrapUnwrap, isAtaCreationDisabled])

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
