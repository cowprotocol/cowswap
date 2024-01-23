import { useMemo } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeState } from './useTradeState'

function getIsWrappedNativeToken(chainId: SupportedChainId, tokenId: string): boolean {
  const nativeToken = WRAPPED_NATIVE_CURRENCIES[chainId]

  return doesTokenMatchSymbolOrAddress(nativeToken, tokenId)
}

export function useIsWrappedIn(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(chainId && inputCurrencyId && getIsWrappedNativeToken(chainId, inputCurrencyId)),
    [chainId, inputCurrencyId]
  )
}
export function useIsWrappedOut(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { outputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(chainId && outputCurrencyId && getIsWrappedNativeToken(chainId, outputCurrencyId)),
    [chainId, outputCurrencyId]
  )
}
