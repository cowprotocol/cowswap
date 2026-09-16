import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useBalancesAccountForChain } from 'entities/balancesContext/useBalancesAccountForChain'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useSourceChainId } from './useSourceChainId'

import { useTokenDataSources } from '../containers/SelectTokenWidget/hooks/useTokenDataSources'
import { useTokenSelectionHandler } from '../containers/SelectTokenWidget/hooks/useTokenSelectionHandler'
import { SelectTokenContext } from '../types'

interface UseSelectTokenContextParams {
  onTokenListItemClick?: (token: TokenWithLogo) => void
}

export function useSelectTokenContext(params?: UseSelectTokenContextParams): SelectTokenContext {
  const { chainId: sourceChainId } = useSourceChainId()
  const widgetState = useSelectTokenWidgetState()
  const tokenData = useTokenDataSources()

  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)

  const balancesAccount = useBalancesAccountForChain(sourceChainId)
  const isWalletConnected = !!balancesAccount

  return useMemo(
    () => ({
      balancesState: tokenData.balancesState,
      selectedToken: widgetState.selectedToken,
      onSelectToken: handleSelectToken,
      onTokenListItemClick: params?.onTokenListItemClick,
      unsupportedTokens: tokenData.unsupportedTokens,
      permitCompatibleTokens: tokenData.permitCompatibleTokens,
      tokenListTags: tokenData.tokenListTags,
      isWalletConnected,
    }),
    [
      tokenData.balancesState,
      widgetState.selectedToken,
      handleSelectToken,
      params?.onTokenListItemClick,
      tokenData.unsupportedTokens,
      tokenData.permitCompatibleTokens,
      tokenData.tokenListTags,
      isWalletConnected,
    ],
  )
}
