import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { HelpTooltip } from '@cowprotocol/ui'

import { Link } from 'react-router'

import * as styledEl from './styled'

import { SelectTokenContext } from '../../types'
import { TokenListItemContainer } from '../TokenListItemContainer'

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
        <styledEl.Title>Favourite tokens</styledEl.Title>
        {!hideTooltip && <FavoriteTokensTooltip />}
      </styledEl.TitleRow>
      <styledEl.List>
        <FavoriteTokensItems tokens={tokens} selectTokenContext={selectTokenContext} />
      </styledEl.List>
    </styledEl.Section>
  )
}

function FavoriteTokensTooltip(): ReactNode {
  return (
    <HelpTooltip
      text={
        <>
          Your favorite saved tokens. Edit this list in the <Link to="/account/tokens">Tokens page</Link>.
        </>
      }
    />
  )
}

interface FavoriteTokensItemsProps {
  tokens: TokenWithLogo[]
  selectTokenContext: SelectTokenContext
}

function FavoriteTokensItems({ tokens, selectTokenContext }: FavoriteTokensItemsProps): ReactNode {
  return createFavoriteTokenItems(tokens, selectTokenContext)
}

function createFavoriteTokenItems(tokens: TokenWithLogo[], selectTokenContext: SelectTokenContext): ReactNode[] {
  const elements: ReactNode[] = []

  for (const token of tokens) {
    elements.push(<TokenListItemContainer key={token.address} token={token} context={selectTokenContext} />)
  }

  return elements
}
