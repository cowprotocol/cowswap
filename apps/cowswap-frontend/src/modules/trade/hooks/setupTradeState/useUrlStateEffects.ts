import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { getDefaultTradeRawState, TradeRawState } from 'modules/trade/types/TradeRawState'

import { UrlStateAnalysis, shouldResetState } from './useUrlStateLogic'

interface HandleUrlStateChangeProps {
  analysis: UrlStateAnalysis
  currentChainId: SupportedChainId
  prevTradeStateFromUrl: TradeRawState | undefined
  tradeStateFromUrl: TradeRawState
  isWalletConnected: boolean
  rememberedUrlStateRef: React.RefObject<TradeRawState | null>
  updateState: ((state: TradeRawState) => void) | undefined
  state: TradeRawState | null
}

function handleResetStateLogging(
  analysis: UrlStateAnalysis,
  currentChainId: SupportedChainId,
  updateState: ((state: TradeRawState) => void) | undefined,
  state: TradeRawState | null,
): void {
  if (analysis.sameTokens) {
    console.debug('[TRADE STATE]', 'Url contains invalid tokens, resetting')
  } else if (analysis.tokensAreEmpty && !analysis.isYieldRoute) {
    console.debug('[TRADE STATE]', 'Url does not contain both tokens, resetting')
  } else if (analysis.onlyChainIdIsChanged) {
    // In this case we should update only chainId in the trade state
    updateState?.({ ...state!, chainId: currentChainId })
    console.debug('[TRADE STATE]', 'Only chainId was changed in URL, resetting')
  }
}

export function useUrlStateEffectLogic(): { handleUrlStateChange: (props: HandleUrlStateChangeProps) => void } {
  const tradeNavigate = useTradeNavigate()

  const handleUrlStateChange = ({
    analysis,
    currentChainId,
    prevTradeStateFromUrl,
    tradeStateFromUrl,
    isWalletConnected,
    rememberedUrlStateRef,
    updateState,
    state,
  }: HandleUrlStateChangeProps): void => {
    const defaultState = getDefaultTradeRawState(currentChainId)

    // While network change in progress and only chainId is changed, then do nothing
    if (rememberedUrlStateRef.current && analysis.onlyChainIdIsChanged) {
      return
    }

    // Applying of the remembered state after network successfully changed
    if (isWalletConnected && analysis.providerAndUrlChainIdMismatch && prevTradeStateFromUrl) {
      rememberedUrlStateRef.current = tradeStateFromUrl
      tradeNavigate(prevTradeStateFromUrl.chainId, prevTradeStateFromUrl)
      console.debug(
        '[TRADE STATE]',
        'Remembering a new state from URL while changing chainId in provider',
        tradeStateFromUrl,
      )
      return
    }

    if (shouldResetState(analysis)) {
      tradeNavigate(currentChainId, defaultState)
      handleResetStateLogging(analysis, currentChainId, updateState, state)
      return
    }

    updateState?.(tradeStateFromUrl)
    console.debug('[TRADE STATE]', 'Applying a new state from URL', tradeStateFromUrl)
  }

  return { handleUrlStateChange }
}