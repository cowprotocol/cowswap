import { useMemo } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getCurrencyAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { useDerivedTradeState, useGetReceiveAmountInfo } from 'modules/trade'

import { useSolanaTradeOverhead } from './useSolanaTradeOverhead'

/**
 * How much native SOL the wallet is short of what the trade transaction actually costs, or `null`
 * when it can afford it or the cost isn't known yet.
 *
 * A Solana trade bundles account creation into the same transaction as the order, so it spends more
 * than the sell amount. Without this the form only checks the sell amount and the wallet rejects the
 * transaction at signing time with a raw `custom program error: 0x1`.
 */
export function useSolanaNativeShortfall(): CurrencyAmount<Currency> | null {
  const { chainId } = useWalletInfo()
  const { values: balances } = useTokensBalancesCombined()
  const inputCurrency = useDerivedTradeState()?.inputCurrency
  const sellAmount = useGetReceiveAmountInfo()?.amountsToSign.sellAmount
  const overhead = useSolanaTradeOverhead()

  const isNativeSell = Boolean(inputCurrency && getIsNativeToken(inputCurrency))

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
