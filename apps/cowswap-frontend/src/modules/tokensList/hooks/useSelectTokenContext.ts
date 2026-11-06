import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSupportedChainId } from '@cowprotocol/common-utils'

import { useBalancesAccountForChain } from 'entities/balancesContext/useBalancesAccountForChain'

import { useChainsToSelect } from './useChainsToSelect'
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
  const chainsToSelect = useChainsToSelect()
  const tokenData = useTokenDataSources()

  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)

  // Also true when only the CoW Shed account-proxy override is set (no EVM wallet connected) -
  // intentional, since that's the account balances are actually fetched for in that case.
  const balancesAccount = useBalancesAccountForChain(sourceChainId)
  // useSourceChainId falls back to the wallet chain for bridge-only targets (e.g. Bitcoin),
  // where the connected wallet has no account, so balances are never fetched there.
  const browsedChainId = chainsToSelect?.defaultChainId ?? widgetState.selectedTargetChainId
  const isBrowsingBridgeOnlyChain = browsedChainId !== undefined && !isSupportedChainId(browsedChainId)
  const isWalletConnected = !!balancesAccount && !isBrowsingBridgeOnlyChain

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
