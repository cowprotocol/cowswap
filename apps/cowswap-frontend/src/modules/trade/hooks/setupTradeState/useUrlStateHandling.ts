import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useTradeTypeInfoFromUrl } from 'modules/trade/hooks/useTradeTypeInfoFromUrl'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'
import { TradeRawState } from 'modules/trade/types/TradeRawState'

import { useTradeStateFromUrl } from './useTradeStateFromUrl'
import { useUrlStateEffectLogic } from './useUrlStateEffects'
import { analyzeUrlState } from './useUrlStateLogic'

interface UseUrlStateHandlingProps {
  currentChainId: SupportedChainId
  prevProviderChainId: SupportedChainId | undefined
  isWalletConnected: boolean
  rememberedUrlStateRef: React.RefObject<TradeRawState | null>
  updateState: ((state: TradeRawState) => void) | undefined
  state: TradeRawState | null
}

export function useUrlStateHandling({
  currentChainId,
  prevProviderChainId,
  isWalletConnected,
  rememberedUrlStateRef,
  updateState,
  state,
}: UseUrlStateHandlingProps): void {
  const tradeStateFromUrl = useTradeStateFromUrl()
  const prevTradeStateFromUrl = usePrevious(tradeStateFromUrl)
  const tradeTypeInfo = useTradeTypeInfoFromUrl()
  const isAlternativeModalVisible = useIsAlternativeOrderModalVisible()
  const { handleUrlStateChange } = useUrlStateEffectLogic()

  /**
   * On URL parameter changes
   *
   * 1. The case, when chainId in URL was changed while wallet is connected (read about it bellow)
   * 2. When chainId in URL is invalid, then redirect to the default chainId
   * 3. When URL contains the same token symbols (USDC/USDC), then redirect to the default state
   * 4. When URL doesn't contain both tokens, then redirect to the default state
   * 5. When only chainId was changed in URL, then redirect to the default state
   * 6. Otherwise, fill the trade state by data from URL
   *
   * *** When chainId in URL was changed while wallet is connected ***
   * Imagine a case:
   *  - user connected a wallet with chainId = 1, URL looks like /1/swap/WETH
   *  - user changed URL to /100/USDC/COW
   *
   * It will require chainId changes in the wallet to 100
   * In case, if user decline network changes, we will have chainId=100 in URL and chainId=1 in wallet
   * It creates some problem due to chainIds mismatch
   *
   * Because of it, in this case we must:
   *  - revert the URL to the previous state (/1/swap/WETH)
   *  - remember the URL changes (/100/USDC/COW)
   *  - apply the URL changes only if user accepted network changes in the wallet
   */
  useEffect(() => {
    // Do nothing when in alternative modal
    // App should already be loaded by then
    if (isAlternativeModalVisible) {
      return
    }
    // Not loaded yet, ignore
    if (!tradeStateFromUrl) {
      return
    }

    const analysis = analyzeUrlState({
      tradeStateFromUrl,
      prevTradeStateFromUrl: prevTradeStateFromUrl || undefined,
      currentChainId,
      prevProviderChainId,
      tradeTypeInfo,
    })

    handleUrlStateChange({
      analysis,
      currentChainId,
      prevTradeStateFromUrl: prevTradeStateFromUrl || undefined,
      tradeStateFromUrl,
      isWalletConnected,
      rememberedUrlStateRef,
      updateState,
      state,
    })

    // Triggering only on changes from URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeStateFromUrl])
}