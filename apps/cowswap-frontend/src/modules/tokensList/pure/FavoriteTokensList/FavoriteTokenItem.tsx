import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenId } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenSymbol } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { SelectTokenContext } from '../../types'

export interface FavoriteTokenItemProps {
  token: TokenWithLogo
  selectTokenContext: SelectTokenContext
}

export function FavoriteTokenItem({ token, selectTokenContext }: FavoriteTokenItemProps): ReactNode {
  const { onTokenListItemClick } = selectTokenContext

  const { selectedToken, onSelectToken } = useSelectTokenWidgetState()

  const isSelected = selectedToken?.isToken && getTokenId(token) === getTokenId(selectedToken)

  const handleClick = (): void => {
    if (isSelected) {
      return
    }
    onTokenListItemClick?.(token)
    onSelectToken?.(token)
  }

  return (
    <styledEl.TokenButton
      data-address={token.address.toLowerCase()}
      data-token-symbol={token.symbol || ''}
      data-token-name={token.name || ''}
      data-element-type="token-selection"
      disabled={isSelected}
      onClick={handleClick}
    >
      <TokenLogo token={token} size={24} />
      <TokenSymbol token={token} />
    </styledEl.TokenButton>
  )
}
