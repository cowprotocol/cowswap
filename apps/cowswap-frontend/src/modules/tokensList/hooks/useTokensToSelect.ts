import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAllActiveTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { useBridgeSupportedTokens } from 'modules/bridge'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

const EMPTY_TOKENS: TokenWithLogo[] = []

export function useTokensToSelect() {
  const { chainId } = useWalletInfo()
  const { selectedTargetChainId = chainId, field } = useSelectTokenWidgetState()
  const allTokens = useAllActiveTokens()

  // TODO: display loading state in UI
  const { data: bridgeSupportedTokens } = useBridgeSupportedTokens(selectedTargetChainId)

  return (
    (field === Field.OUTPUT ? (selectedTargetChainId === chainId ? allTokens : bridgeSupportedTokens) : allTokens) ||
    EMPTY_TOKENS
  )
}
