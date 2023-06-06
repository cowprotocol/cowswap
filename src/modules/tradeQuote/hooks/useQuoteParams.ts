import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useWalletInfo } from 'modules/wallet'

import { getAddress } from 'utils/getAddress'

import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export function useQuoteParams() {
  const { chainId, account } = useWalletInfo()
  const { state } = useDerivedTradeState()
  const { amount } = useAtomValue(tradeQuoteParamsAtom)

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const amountStr = amount?.quotient.toString()

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || !amountStr) {
      return
    }

    const sellToken = getAddress(inputCurrency)
    const buyToken = getAddress(outputCurrency)
    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    return {
      sellToken,
      buyToken,
      amount: amountStr,
      chainId,
      receiver: account,
      kind: orderKind,
      toDecimals,
      fromDecimals,
      isEthFlow: false,
    }
  }, [inputCurrency, outputCurrency, amountStr, account, chainId, orderKind])
}
