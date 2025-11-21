import { type TradeRawState } from 'modules/trade/types/TradeRawState'

const EMPTY_TOKEN_ID = '_'

export function isSameTradeUrlState(
  left: TradeRawState | null | undefined,
  right:
    | (
        | TradeRawState
        | {
            chainId: number | null
            targetChainId: number | null
            inputCurrencyId: string | null
            outputCurrencyId: string | null
            recipient?: string | null
            recipientAddress?: string | null
          }
      )
    | null
    | undefined,
): boolean {
  if (!left || !right) {
    return false
  }

  return (
    left.chainId === right.chainId &&
    left.targetChainId === right.targetChainId &&
    left.inputCurrencyId === right.inputCurrencyId &&
    left.outputCurrencyId === right.outputCurrencyId &&
    left.recipient === right.recipient &&
    left.recipientAddress === right.recipientAddress
  )
}

export function areTokensEmpty(tradeState: TradeRawState): boolean {
  const { inputCurrencyId, outputCurrencyId } = tradeState

  return !inputCurrencyId && !outputCurrencyId
}

export function hasSameTokens(tradeState: TradeRawState): boolean {
  const { inputCurrencyId, outputCurrencyId } = tradeState

  if (!inputCurrencyId || !outputCurrencyId) {
    return false
  }

  if (inputCurrencyId === EMPTY_TOKEN_ID) {
    return false
  }

  return inputCurrencyId.toLowerCase() === outputCurrencyId.toLowerCase()
}

export function isOnlyChainIdChanged(
  previousState: TradeRawState | null | undefined,
  currentState: TradeRawState,
  currentChainId: number,
): boolean {
  if (!previousState) {
    return false
  }

  const sameInputToken = previousState.inputCurrencyId === currentState.inputCurrencyId
  const sameOutputToken = previousState.outputCurrencyId === currentState.outputCurrencyId
  const chainIdChanged = previousState.chainId !== currentChainId

  return sameInputToken && sameOutputToken && chainIdChanged
}

export function shouldIgnoreUrlTradeStateEffect(params: {
  isTokenSelectOpen: boolean
  isAlternativeModalVisible: boolean
  isLimitOrderTrade: boolean
  hasRememberedUrlState: boolean
  onlyChainIdIsChanged: boolean
}): boolean {
  const {
    isTokenSelectOpen,
    isAlternativeModalVisible,
    isLimitOrderTrade,
    hasRememberedUrlState,
    onlyChainIdIsChanged,
  } = params

  if (isTokenSelectOpen) {
    return true
  }

  if (isAlternativeModalVisible && isLimitOrderTrade) {
    return true
  }

  if (hasRememberedUrlState && onlyChainIdIsChanged) {
    return true
  }

  return false
}

export type UrlIssueReason = 'none' | 'sameTokens' | 'tokensEmpty' | 'onlyChainChanged'

export function getUrlIssueReason(params: {
  sameTokens: boolean
  tokensAreEmpty: boolean
  onlyChainIdIsChanged: boolean
}): UrlIssueReason {
  const { sameTokens, tokensAreEmpty, onlyChainIdIsChanged } = params

  if (sameTokens) {
    return 'sameTokens'
  }

  if (tokensAreEmpty) {
    return 'tokensEmpty'
  }

  if (onlyChainIdIsChanged) {
    return 'onlyChainChanged'
  }

  return 'none'
}

