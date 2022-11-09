import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai/utils'
import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useEffect } from 'react'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { useTradeNavigate } from '@cow/modules/trade/hooks/useTradeNavigate'

/**
 * To avoid WRAP/UNWRAP/ETH-flow cases in the Limit orders page
 * We disable selecting of native currency
 * We set `disableNonToken` as true to `CurrencyInputPanel` component as well
 */
export function useDisableNativeTokenUsage() {
  const { chainId } = useWeb3React()
  const { inputCurrencyId, outputCurrencyId } = useAtomValue(limitOrdersAtom)
  const limitOrdersNavigate = useTradeNavigate()

  useEffect(() => {
    const nativeToken = chainId ? NATIVE_CURRENCY_BUY_TOKEN[chainId] : null

    if (!chainId || !nativeToken) return

    const nativeIds = [nativeToken.address, nativeToken.symbol].map((value) => value?.toLowerCase())

    const isInputNative = !!inputCurrencyId && nativeIds.includes(inputCurrencyId?.toLowerCase())
    const isOutputNative = !!outputCurrencyId && nativeIds.includes(outputCurrencyId?.toLowerCase())

    if (isInputNative || isOutputNative) {
      limitOrdersNavigate(chainId, {
        inputCurrencyId: isInputNative ? null : inputCurrencyId,
        outputCurrencyId: isOutputNative ? null : outputCurrencyId,
      })
    }
  }, [chainId, inputCurrencyId, outputCurrencyId, limitOrdersNavigate])
}
