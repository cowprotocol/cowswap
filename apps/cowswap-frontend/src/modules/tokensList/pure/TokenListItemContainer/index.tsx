import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useCrossChainBalances } from '../../hooks/useCrossChainBalances'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { SelectTokenContext } from '../../types'
import { TokenListItem } from '../TokenListItem'

interface TokenListItemContainerProps {
  token: TokenWithLogo
  context: SelectTokenContext
  disabled?: boolean
  disabledReason?: string
}

export function TokenListItemContainer({
  token,
  context,
  disabled,
  disabledReason,
}: TokenListItemContainerProps): ReactNode {
  const {
    unsupportedTokens,
    onTokenListItemClick,
    onSelectNetwork,
    tokenListTags,
    permitCompatibleTokens,
    balancesState: { values: balances },
    isWalletConnected,
  } = context

  const { onSelectToken, selectedToken } = useSelectTokenWidgetState()
  const crossChainBalances = useCrossChainBalances(token)

  const addressKey = getAddressKey(token.address)
  const handleSelectToken = useCallback(
    (tokenToSelect: TokenWithLogo) => {
      onTokenListItemClick?.(tokenToSelect)
      onSelectToken?.(tokenToSelect)
    },
    [onSelectToken, onTokenListItemClick],
  )
  const handleSelectNetworkToken = useCallback(
    (chainId: SupportedChainId, tokenToSelect: TokenWithLogo) => {
      const switchNetwork = onSelectNetwork ? onSelectNetwork(chainId) : Promise.resolve()
      switchNetwork.then(() => handleSelectToken(tokenToSelect))
    },
    [onSelectNetwork, handleSelectToken],
  )

  return (
    <TokenListItem
      isUnsupported={!!unsupportedTokens[addressKey]}
      isPermitCompatible={permitCompatibleTokens[addressKey]}
      selectedToken={selectedToken}
      token={token}
      balance={balances ? balances[addressKey] : undefined}
      crossChainBalances={crossChainBalances}
      onSelectToken={handleSelectToken}
      onSelectNetworkToken={handleSelectNetworkToken}
      isWalletConnected={isWalletConnected}
      tokenListTags={tokenListTags}
      disabled={disabled}
      disabledReason={disabledReason}
    />
  )
}
