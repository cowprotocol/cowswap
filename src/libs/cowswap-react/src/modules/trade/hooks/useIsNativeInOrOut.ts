import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

import { doesTokenMatchSymbolOrAddress } from 'utils/doesTokenMatchSymbolOrAddress'

import { useTradeState } from './useTradeState'

function getIsNativeToken(chainId: SupportedChainId, tokenId: string): boolean {
  const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId]

  if (!supportedChainId(chainId)) {
    return false
  }

  return doesTokenMatchSymbolOrAddress(nativeToken, tokenId)
}

export function useIsNativeIn(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(chainId && inputCurrencyId && getIsNativeToken(chainId, inputCurrencyId)),
    [chainId, inputCurrencyId]
  )
}

export function useIsNativeOut(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { outputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(chainId && outputCurrencyId && getIsNativeToken(chainId, outputCurrencyId)),
    [chainId, outputCurrencyId]
  )
}
