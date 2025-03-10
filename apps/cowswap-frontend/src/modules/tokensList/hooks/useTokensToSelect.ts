import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAllActiveTokens } from '@cowprotocol/tokens'

import { useBridgeSupportedTokens } from 'modules/bridge'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

const EMPTY_TOKENS: TokenWithLogo[] = []

export function useTokensToSelect() {
  const { selectedTargetChainId } = useSelectTokenWidgetState()
  const allTokens = useAllActiveTokens()

  // TODO: display loading state in UI
  const { data: bridgeSupportedTokens } = useBridgeSupportedTokens(selectedTargetChainId)

  return (typeof selectedTargetChainId === 'undefined' ? allTokens : bridgeSupportedTokens) || EMPTY_TOKENS
}
