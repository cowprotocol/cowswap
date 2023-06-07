import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { WRAPPED_NATIVE_CURRENCY } from 'legacy/constants/tokens'

import { useWalletInfo } from 'modules/wallet'

import { doesTokenMatchSymbolOrAddress } from 'utils/doesTokenMatchSymbolOrAddress'

import { useTradeState } from './useTradeState'

function getIsWrappedNativeToken(chainId: SupportedChainId, tokenId: string): boolean {
  const nativeToken = WRAPPED_NATIVE_CURRENCY[chainId]

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
