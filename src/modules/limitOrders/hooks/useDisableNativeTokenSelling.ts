import { useAtomValue } from 'jotai/utils'
import { limitOrdersRawStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { useEffect } from 'react'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'
import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { WRAPPED_NATIVE_CURRENCY } from 'legacy/constants/tokens'
import { useWalletInfo } from 'modules/wallet'

/**
 * Since the selling of ETH is not supported in limit orders
 * We automatically replace it by WETH
 */
export function useDisableNativeTokenSelling() {
  const { chainId } = useWalletInfo()
  const { inputCurrencyId, outputCurrencyId } = useAtomValue(limitOrdersRawStateAtom)
  const limitOrdersNavigate = useTradeNavigate()

  useEffect(() => {
    const nativeToken = chainId ? NATIVE_CURRENCY_BUY_TOKEN[chainId] : null
    const wrappedToken = chainId ? WRAPPED_NATIVE_CURRENCY[chainId] : null

    if (!chainId || !nativeToken || !wrappedToken) return

    const nativeIds = [nativeToken.address, nativeToken.symbol].map((value) => value?.toLowerCase())
    const wrappedIds = [wrappedToken.address, wrappedToken.symbol].map((value) => value?.toLowerCase())

    const isInputNative = !!inputCurrencyId && nativeIds.includes(inputCurrencyId?.toLowerCase())
    const isOutputWrappedNative = !!outputCurrencyId && wrappedIds.includes(outputCurrencyId?.toLowerCase())

    const defaultInputCurrencyId = getDefaultTradeRawState(chainId).inputCurrencyId

    if (isInputNative && outputCurrencyId && !isOutputWrappedNative) {
      limitOrdersNavigate(chainId, {
        inputCurrencyId: isInputNative ? defaultInputCurrencyId : inputCurrencyId,
        outputCurrencyId,
      })
    }
  }, [chainId, inputCurrencyId, outputCurrencyId, limitOrdersNavigate])
}
