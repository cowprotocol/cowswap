import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { areAddressesEqual, getCurrencyAddress } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenSymbol } from '@cowprotocol/ui'

import { Link } from 'react-router'

import * as styledEl from './styled'

import { SelectTokenContext } from '../../types'

export interface FavoriteTokensListProps {
  tokens: TokenWithLogo[]
  selectTokenContext: SelectTokenContext
  hideTooltip?: boolean
}

export function FavoriteTokensList(props: FavoriteTokensListProps): ReactNode {
  const { tokens, selectTokenContext, hideTooltip } = props

  if (!tokens.length) {
    return null
  }

  return (
    <styledEl.Section data-testid="favorite-tokens-section">
      <styledEl.TitleRow>
        <styledEl.Title>Favorite tokens</styledEl.Title>
        {!hideTooltip && <FavoriteTokensTooltip />}
      </styledEl.TitleRow>
      <styledEl.List>{renderFavoriteTokenItems(tokens, selectTokenContext)}</styledEl.List>
    </styledEl.Section>
  )
}

function FavoriteTokensTooltip(): ReactNode {
  return (
    <styledEl.FavoriteTooltip
      text={
        <>
          Your favorite saved tokens. Edit this list in the <Link to="/account/tokens">Tokens page</Link>.
        </>
      }
    />
  )
}

function renderFavoriteTokenItems(tokens: TokenWithLogo[], context: SelectTokenContext): ReactNode[] {
  const { selectedToken } = context
  const selectedAddress = selectedToken ? getCurrencyAddress(selectedToken) : undefined

  return tokens.map((token) => {
    const isSelected =
      !!selectedToken &&
      token.chainId === selectedToken.chainId &&
      !!selectedAddress &&
      areAddressesEqual(token.address, selectedAddress)

    const handleClick = (): void => {
      if (isSelected) {
        return
      }
      context.onTokenListItemClick?.(token)
      context.onSelectToken(token)
    }

    return (
      <styledEl.TokenButton
        key={`${token.chainId}:${token.address}`}
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
  })
}
