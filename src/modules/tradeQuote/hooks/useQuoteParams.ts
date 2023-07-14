import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useWalletInfo } from 'modules/wallet'

import { getAddress } from 'utils/getAddress'

import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export function useQuoteParams() {
  const { chainId, account } = useWalletInfo()
  const { state } = useDerivedTradeState()
  const { amount } = useAtomValue(tradeQuoteParamsAtom)

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || !amount) {
      return
    }

    const sellToken = getAddress(inputCurrency)
    const buyToken = outputCurrency.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : getAddress(outputCurrency)
    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    if (!sellToken || !buyToken) return

    return {
      sellToken,
      buyToken,
      amount,
      chainId,
      receiver: account,
      kind: orderKind,
      toDecimals,
      fromDecimals,
      isEthFlow: false,
    }
  }, [inputCurrency, outputCurrency, amount, account, chainId, orderKind])
}
