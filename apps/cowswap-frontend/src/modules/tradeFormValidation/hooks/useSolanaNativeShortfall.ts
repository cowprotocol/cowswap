import { useMemo } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getCurrencyAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import useSWR from 'swr'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import {
  getSolanaTradeOverhead,
  planSolanaTradeFundedAccounts,
  useDerivedTradeState,
  useGetReceiveAmountInfo,
} from 'modules/trade'
import type { SolanaFundedAccount } from 'modules/trade'
import { isSolanaQuoteAndPost, useTradeQuote } from 'modules/tradeQuote'

/**
 * How much native SOL the wallet is short of what the trade transaction actually costs, or `null`
 * when it can afford it or the cost isn't known yet.
 *
 * A Solana trade bundles account creation into the same transaction as the order, so it spends more
 * than the sell amount. Without this the form only checks the sell amount and the wallet rejects the
 * transaction at signing time with a raw `custom program error: 0x1`.
 */
export function useSolanaNativeShortfall(): CurrencyAmount<Currency> | null {
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
  const { quote } = useTradeQuote()
  const { values: balances } = useTokensBalancesCombined()
  const inputCurrency = useDerivedTradeState()?.inputCurrency
  const sellAmount = useGetReceiveAmountInfo()?.amountsToSign.sellAmount

  const isNativeSell = Boolean(inputCurrency && getIsNativeToken(inputCurrency))
  const solanaQuote = isSolanaQuoteAndPost(quote) ? quote.solanaQuote : null

  const fundedAccounts = useMemo(() => {
    if (!isSolanaChain(chainId) || !account || !solanaQuote) return null

    return planSolanaTradeFundedAccounts({ owner: new PublicKey(account), quote: solanaQuote, isNativeSell })
  }, [chainId, account, solanaQuote, isNativeSell])

  // Keyed on the accounts rather than the typed amount: rent doesn't depend on how much is being sold,
  // so typing must not refetch. The amount only enters the comparison below.
  const { data: overhead } = useSWR(
    connection && fundedAccounts ? [toFundedAccountsKey(fundedAccounts), 'solanaTradeOverhead'] : null,
    () => (connection && fundedAccounts ? getSolanaTradeOverhead(connection, fundedAccounts) : null),
  )

  return useMemo(() => {
    if (!overhead || !isSolanaChain(chainId)) return null

    const nativeCurrency = NATIVE_CURRENCIES[chainId]
    const balance = balances[getAddressKey(getCurrencyAddress(nativeCurrency))]

    if (balance === undefined) return null

    const sellLamports = isNativeSell && sellAmount ? BigInt(sellAmount.quotient.toString()) : 0n
    const shortfall = overhead + sellLamports - balance

    return shortfall > 0n ? CurrencyAmount.fromRawAmount(nativeCurrency, shortfall.toString()) : null
  }, [overhead, chainId, balances, isNativeSell, sellAmount])
}

function toFundedAccountsKey(fundedAccounts: SolanaFundedAccount[]): string {
  return fundedAccounts
    .map(({ address, size }) => {
      const sizeKey = typeof size === 'number' ? size : `${size.mint.toBase58()}/${size.tokenProgramId.toBase58()}`

      return `${address?.toBase58() ?? ''}:${sizeKey}`
    })
    .join('|')
}
