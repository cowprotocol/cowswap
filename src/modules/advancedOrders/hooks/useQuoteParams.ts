import { useAtomValue } from 'jotai/utils'
import { advancedOrdersAtom, advancedOrdersDerivedStateAtom } from 'modules/advancedOrders/state/advancedOrdersAtom'
import { useMemo } from 'react'
import { getAddress } from 'utils/getAddress'
import { parseUnits } from 'ethers/lib/utils'
import { useWalletInfo } from 'modules/wallet'
import { OrderKind } from '@cowprotocol/cow-sdk'

// TODO: probably also can be unified for each trade widget
export function useQuoteParams() {
  const { chainId, account } = useWalletInfo()
  const { inputCurrency, outputCurrency } = useAtomValue(advancedOrdersDerivedStateAtom)
  const { typedValue } = useAtomValue(advancedOrdersAtom)

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
