import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenAddressKey } from '@cowprotocol/common-utils'

import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { SelectTokenContext } from '../../types'
import { TokenListItem } from '../TokenListItem'

interface TokenListItemContainerProps {
  token: TokenWithLogo
  context: SelectTokenContext
}

export function TokenListItemContainer({ token, context }: TokenListItemContainerProps): ReactNode {
  const {
    unsupportedTokens,
    onTokenListItemClick,
    tokenListTags,
    permitCompatibleTokens,
    balancesState: { values: balances },
    isWalletConnected,
  } = context

  const { onSelectToken, selectedToken } = useSelectTokenWidgetState()

  const addressKey = getTokenAddressKey(token.address)
  const handleSelectToken = useCallback(
    (tokenToSelect: TokenWithLogo) => {
      onTokenListItemClick?.(tokenToSelect)
      onSelectToken?.(tokenToSelect)
    },
    [onSelectToken, onTokenListItemClick],
  )

  return (
    <TokenListItem
      isUnsupported={!!unsupportedTokens[addressKey]}
      isPermitCompatible={permitCompatibleTokens[addressKey]}
      selectedToken={selectedToken}
      token={token}
      balance={balances ? balances[addressKey] : undefined}
      onSelectToken={handleSelectToken}
      isWalletConnected={isWalletConnected}
      tokenListTags={tokenListTags}
    />
  )
}
