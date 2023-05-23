import { useMemo } from 'react'
import { getAddress } from 'utils/getAddress'
import { useWalletInfo } from 'modules/wallet'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

export function useQuoteParams() {
  const { chainId, account } = useWalletInfo()
  const { state } = useDerivedTradeState()

  const { inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount, orderKind } = state || {}
  const currencyAmount = orderKind === OrderKind.SELL ? inputCurrencyAmount : outputCurrencyAmount

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || !currencyAmount) {
      return
    }

    const sellToken = getAddress(inputCurrency)
    const buyToken = getAddress(outputCurrency)
    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    return {
      sellToken,
      buyToken,
      amount: currencyAmount.quotient,
      chainId,
      receiver: account,
      kind: OrderKind.SELL,
      toDecimals,
      fromDecimals,
      isEthFlow: false,
    }
  }, [inputCurrency, outputCurrency, currencyAmount, account, chainId])
}
