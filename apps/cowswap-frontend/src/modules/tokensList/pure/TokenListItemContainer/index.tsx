import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

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
    tokenListTags,
    permitCompatibleTokens,
    balancesState: { values: balances },
    isWalletConnected,
  } = context

  const { onSelectToken, selectedToken } = useSelectTokenWidgetState()

  const addressLowerCase = token.address.toLowerCase()

  return (
    <TokenListItem
      isUnsupported={!!unsupportedTokens[addressLowerCase]}
      isPermitCompatible={permitCompatibleTokens[addressLowerCase]}
      selectedToken={selectedToken}
      token={token}
      balance={balances ? balances[token.address.toLowerCase()] : undefined}
      onSelectToken={onSelectToken}
      isWalletConnected={isWalletConnected}
      tokenListTags={tokenListTags}
    />
  )
}
