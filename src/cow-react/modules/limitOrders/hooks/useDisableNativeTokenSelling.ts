import { useAtomValue } from 'jotai/utils'
import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useEffect } from 'react'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { useTradeNavigate } from '@cow/modules/trade/hooks/useTradeNavigate'
import { getDefaultTradeState } from '@cow/modules/trade/types/TradeState'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useWalletInfo } from '@cow/modules/wallet'

/**
 * Since the selling of ETH is not supported in limit orders
 * We automatically replace it by WETH
 */
export function useDisableNativeTokenSelling() {
  const { chainId } = useWalletInfo()
  const { inputCurrencyId, outputCurrencyId } = useAtomValue(limitOrdersAtom)
  const limitOrdersNavigate = useTradeNavigate()

  useEffect(() => {
    const nativeToken = chainId ? NATIVE_CURRENCY_BUY_TOKEN[chainId] : null
    const wrappedToken = chainId ? WRAPPED_NATIVE_CURRENCY[chainId] : null

    if (!chainId || !nativeToken || !wrappedToken) return

    const nativeIds = [nativeToken.address, nativeToken.symbol].map((value) => value?.toLowerCase())
    const wrappedIds = [wrappedToken.address, wrappedToken.symbol].map((value) => value?.toLowerCase())

    const isInputNative = !!inputCurrencyId && nativeIds.includes(inputCurrencyId?.toLowerCase())
    const isOutputWrappedNative = !!outputCurrencyId && wrappedIds.includes(outputCurrencyId?.toLowerCase())

    const defaultInputCurrencyId = getDefaultTradeState(chainId).inputCurrencyId

    if (isInputNative && outputCurrencyId && !isOutputWrappedNative) {
      limitOrdersNavigate(chainId, {
        inputCurrencyId: isInputNative ? defaultInputCurrencyId : inputCurrencyId,
        outputCurrencyId,
      })
    }
  }, [chainId, inputCurrencyId, outputCurrencyId, limitOrdersNavigate])
}
