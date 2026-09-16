import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useSolanaAccount, useWalletInfo } from '@cowprotocol/wallet'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useSourceChainId } from './useSourceChainId'

import { useTokenDataSources } from '../containers/SelectTokenWidget/hooks/useTokenDataSources'
import { useTokenSelectionHandler } from '../containers/SelectTokenWidget/hooks/useTokenSelectionHandler'
import { SelectTokenContext } from '../types'

interface UseSelectTokenContextParams {
  onTokenListItemClick?: (token: TokenWithLogo) => void
}

export function useSelectTokenContext(params?: UseSelectTokenContextParams): SelectTokenContext {
  const { account } = useWalletInfo()
  const solanaAccount = useSolanaAccount()
  const { chainId: sourceChainId } = useSourceChainId()
  const widgetState = useSelectTokenWidgetState()
  const tokenData = useTokenDataSources()

  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)

  // A Solana account can't be derived from the connected EVM wallet, so when browsing Solana as
  // a bridge destination without a connected Solana account, balances will never be fetched.
  // Report as "not connected" here so the token list hides balances instead of showing a
  // skeleton that waits on a fetch that will never happen.
  const isWalletConnected = isSolanaChain(sourceChainId) ? !!solanaAccount : !!account

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
