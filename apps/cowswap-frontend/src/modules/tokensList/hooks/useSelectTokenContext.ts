import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { useTokenDataSources } from '../containers/SelectTokenWidget/hooks/useTokenDataSources'
import { useTokenSelectionHandler } from '../containers/SelectTokenWidget/hooks/useTokenSelectionHandler'
import { SelectTokenContext } from '../types'

interface UseSelectTokenContextParams {
  onTokenListItemClick?: (token: TokenWithLogo) => void
}

export function useSelectTokenContext(params?: UseSelectTokenContextParams): SelectTokenContext {
  const { account } = useWalletInfo()
  const widgetState = useSelectTokenWidgetState()
  const tokenData = useTokenDataSources()

  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)
  const onSelectNetwork = useOnSelectNetwork()

  return useMemo(
    () => ({
      balancesState: tokenData.balancesState,
      selectedToken: widgetState.selectedToken,
      onSelectToken: handleSelectToken,
      onSelectNetwork,
      onTokenListItemClick: params?.onTokenListItemClick,
      unsupportedTokens: tokenData.unsupportedTokens,
      permitCompatibleTokens: tokenData.permitCompatibleTokens,
      tokenListTags: tokenData.tokenListTags,
      isWalletConnected: !!account,
    }),
    [
      tokenData.balancesState,
      widgetState.selectedToken,
      handleSelectToken,
      onSelectNetwork,
      params?.onTokenListItemClick,
      tokenData.unsupportedTokens,
      tokenData.permitCompatibleTokens,
      tokenData.tokenListTags,
      account,
    ],
  )
}
