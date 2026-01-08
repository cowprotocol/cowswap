import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { SelectTokenContext } from '../../types'
import { TokenListItem } from '../TokenListItem'

interface TokenListItemContainerProps {
  token: TokenWithLogo
  context: SelectTokenContext
}

export function TokenListItemContainer({ token, context }: TokenListItemContainerProps): ReactNode {
  const {
    unsupportedTokens,
    onSelectToken,
    onTokenListItemClick,
    selectedToken,
    tokenListTags,
    permitCompatibleTokens,
    balancesState: { values: balances },
    isWalletConnected,
  } = context

  const addressLowerCase = token.address.toLowerCase()
  const handleSelectToken = useCallback(
    (tokenToSelect: TokenWithLogo) => {
      onTokenListItemClick?.(tokenToSelect)
      onSelectToken(tokenToSelect)
    },
    [onSelectToken, onTokenListItemClick],
  )

  return (
    <TokenListItem
      isUnsupported={!!unsupportedTokens[addressLowerCase]}
      isPermitCompatible={permitCompatibleTokens[addressLowerCase]}
      selectedToken={selectedToken}
      token={token}
      balance={balances ? balances[addressLowerCase] : undefined}
      onSelectToken={handleSelectToken}
      isWalletConnected={isWalletConnected}
      tokenListTags={tokenListTags}
    />
  )
}
