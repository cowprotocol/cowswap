import { useMemo } from 'react'
import { getAddress } from 'utils/getAddress'
import { parseUnits } from 'ethers/lib/utils'
import { useWalletInfo } from 'modules/wallet'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

export function useQuoteParams() {
  const { chainId, account } = useWalletInfo()
  const { state } = useDerivedTradeState()

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency
  const typedValue = state?.typedValue

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || !typedValue) {
      return
    }

    const sellToken = getAddress(inputCurrency)
    const buyToken = getAddress(outputCurrency)
    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    const amount = parseUnits(typedValue, inputCurrency?.decimals)

    return {
      sellToken,
      buyToken,
      amount,
      chainId,
      receiver: account,
      kind: OrderKind.SELL,
      toDecimals,
      fromDecimals,
      isEthFlow: false,
    }
  }, [inputCurrency, outputCurrency, typedValue, account, chainId])
}
