import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { useWalletInfo } from 'modules/wallet'
import { supportedChainId } from 'utils/supportedChainId'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { checkBySymbolAndAddress } from 'utils/checkBySymbolAndAddress'
import { useMemo } from 'react'

export function useIsWrapOrUnwrap(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = state || {}

  return useMemo(() => {
    if (!chainId || !supportedChainId(chainId)) return false

    if (!inputCurrencyId || !outputCurrencyId) return false

    const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId]
    const wrappedToken = WRAPPED_NATIVE_CURRENCY[chainId]

    const isNativeIn = checkBySymbolAndAddress(nativeToken, inputCurrencyId)
    const isNativeOut = checkBySymbolAndAddress(nativeToken, outputCurrencyId)

    const isWrappedIn = checkBySymbolAndAddress(wrappedToken, inputCurrencyId)
    const isWrappedOut = checkBySymbolAndAddress(wrappedToken, outputCurrencyId)

    return (isNativeIn && isWrappedOut) || (isNativeOut && isWrappedIn)
  }, [chainId, inputCurrencyId, outputCurrencyId])
}
