import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { areAddressesEqual, getCurrencyAddress } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
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
        <styledEl.Title>
          <Trans>Favorite tokens</Trans>
        </styledEl.Title>
        {!hideTooltip && <FavoriteTokensTooltip />}
      </styledEl.TitleRow>
      <styledEl.List>
        <FavoriteTokenItems tokens={tokens} selectTokenContext={selectTokenContext} />
      </styledEl.List>
    </styledEl.Section>
  )
}

function FavoriteTokensTooltip(): ReactNode {
  return (
    <styledEl.FavoriteTooltip
      text={
        <Trans>
          Your favorite saved tokens. Edit this list in the <Link to="/account/tokens">Tokens page</Link>.
        </Trans>
      }
    />
  )
}

interface FavoriteTokenItemProps {
  token: TokenWithLogo
  selectTokenContext: SelectTokenContext
}

function FavoriteTokenItem({ token, selectTokenContext }: FavoriteTokenItemProps): ReactNode {
  const { selectedToken, onTokenListItemClick, onSelectToken } = selectTokenContext
  const selectedAddress = selectedToken ? getCurrencyAddress(selectedToken) : undefined

  const isSelected =
    !!selectedToken &&
    token.chainId === selectedToken.chainId &&
    !!selectedAddress &&
    areAddressesEqual(token.address, selectedAddress)

  const handleClick = (): void => {
    if (isSelected) {
      return
    }
    onTokenListItemClick?.(token)
    onSelectToken(token)
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

interface FavoriteTokenItemsProps {
  tokens: TokenWithLogo[]
  selectTokenContext: SelectTokenContext
}

function FavoriteTokenItems({ tokens, selectTokenContext }: FavoriteTokenItemsProps): ReactNode {
  return (
    <>
      {tokens.map((token) => (
        <FavoriteTokenItem
          key={`${token.chainId}:${token.address}`}
          token={token}
          selectTokenContext={selectTokenContext}
        />
      ))}
    </>
  )
}
