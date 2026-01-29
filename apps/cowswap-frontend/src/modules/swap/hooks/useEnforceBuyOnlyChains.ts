import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { isNonEvmChainId } from 'common/chains/nonEvm'

import { useSwapDerivedState } from './useSwapDerivedState'
import { useSwapRawState } from './useSwapRawState'
import { useUpdateSwapRawState } from './useUpdateSwapRawState'

import { getDefaultSwapState } from '../state/swapRawStateAtom'

function toSupportedChainId(chainId: number | undefined | null): SupportedChainId | null {
  if (typeof chainId !== 'number') return null

  return chainId in SupportedChainId ? (chainId as SupportedChainId) : null
}

export function useEnforceBuyOnlyChains(): void {
  const { chainId: walletChainId } = useWalletInfo()
  const rawState = useSwapRawState()
  const derivedState = useSwapDerivedState()
  const updateSwapRawState = useUpdateSwapRawState()

  useEffect(() => {
    const supportedWalletChainId = toSupportedChainId(walletChainId)
    if (!supportedWalletChainId) return

    const sellChainId = rawState.chainId ?? supportedWalletChainId
    const inputChainId = derivedState.inputCurrency?.chainId

    const isNonEvmSellSide = isNonEvmChainId(sellChainId) || isNonEvmChainId(inputChainId)
    if (!isNonEvmSellSide) return

    const defaults = getDefaultSwapState(supportedWalletChainId)

    updateSwapRawState({
      chainId: supportedWalletChainId,
      targetChainId: null,
      inputCurrencyId: defaults.inputCurrencyId,
      outputCurrencyId: defaults.outputCurrencyId,
      inputCurrencyAmount: null,
      outputCurrencyAmount: null,
      orderKind: rawState.orderKind,
      isUnlocked: rawState.isUnlocked,
    })
  }, [walletChainId, rawState, derivedState.inputCurrency, updateSwapRawState])
}
