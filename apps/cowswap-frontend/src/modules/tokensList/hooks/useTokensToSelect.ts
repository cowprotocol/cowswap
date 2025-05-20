import { useMemo } from 'react'

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
  const allTokens = useAllActiveTokens().tokens

  const areTokensFromBridge = field === Field.OUTPUT && selectedTargetChainId !== chainId

  const { data: bridgeSupportedTokens, isLoading } = useBridgeSupportedTokens(
    areTokensFromBridge ? selectedTargetChainId : undefined,
  )
  return useMemo(() => {
    return {
      isLoading: areTokensFromBridge ? isLoading : false,
      tokens: (areTokensFromBridge ? bridgeSupportedTokens : allTokens) || EMPTY_TOKENS,
    }
  }, [allTokens, bridgeSupportedTokens, isLoading, areTokensFromBridge])
}
