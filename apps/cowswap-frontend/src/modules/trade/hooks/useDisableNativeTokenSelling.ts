import { useEffect } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

import { getDefaultTradeRawState } from '../types/TradeRawState'

/**
 * Since the selling of ETH is not supported in limit and advanced orders
 * We automatically replace it by WETH
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDisableNativeTokenSelling() {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = state || {}
  const navigate = useTradeNavigate()

  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  useEffect(() => {
    const nativeToken = chainId ? NATIVE_CURRENCIES[chainId] : null
    const wrappedToken = chainId ? WRAPPED_NATIVE_CURRENCIES[chainId] : null

    if (!chainId || !nativeToken || !wrappedToken) return

    const nativeIds = [nativeToken.address, nativeToken.symbol].map((value) => value?.toLowerCase())
    const wrappedIds = [wrappedToken.address, wrappedToken.symbol].map((value) => value?.toLowerCase())

    const isInputNative = !!inputCurrencyId && nativeIds.includes(inputCurrencyId?.toLowerCase())
    const isOutputWrappedNative = !!outputCurrencyId && wrappedIds.includes(outputCurrencyId?.toLowerCase())

    const defaultInputCurrencyId = getDefaultTradeRawState(chainId).inputCurrencyId

    if (isInputNative && outputCurrencyId && !isOutputWrappedNative) {
      navigate(chainId, {
        inputCurrencyId: isInputNative ? defaultInputCurrencyId : inputCurrencyId,
        outputCurrencyId,
      })
    }
  }, [chainId, inputCurrencyId, outputCurrencyId, navigate])
}
