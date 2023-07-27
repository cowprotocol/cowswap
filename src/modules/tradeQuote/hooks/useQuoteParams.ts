import { useMemo } from 'react'

import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useWalletInfo } from 'modules/wallet'

import { getAddress } from 'utils/getAddress'

export function useQuoteParams(amount: string | null) {
  const { chainId, account } = useWalletInfo()
  const { state } = useDerivedTradeState()

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const sellToken = getAddress(inputCurrency)
  const buyToken = outputCurrency?.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : getAddress(outputCurrency)
  const fromDecimals = inputCurrency?.decimals
  const toDecimals = outputCurrency?.decimals

  return useMemo(() => {
    if (!sellToken || !buyToken || !amount) return

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
  }, [sellToken, buyToken, toDecimals, fromDecimals, amount, account, chainId, orderKind])
}
