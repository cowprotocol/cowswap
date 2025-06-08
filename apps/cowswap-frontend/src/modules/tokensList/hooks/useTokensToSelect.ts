import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAllActiveTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

const EMPTY_TOKENS: TokenWithLogo[] = []

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
