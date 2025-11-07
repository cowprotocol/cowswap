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
        {!hideTooltip && (
          <HelpTooltip
            text={
              <>
                Your favorite saved tokens. Edit this list in the <Link to="/account/tokens">Tokens page</Link>.
              </>
            }
          />
        )}
      </styledEl.TitleRow>
      <styledEl.List>
        {tokens.map((token) => (
          <TokenListItemContainer key={token.address} token={token} context={selectTokenContext} />
        ))}
      </styledEl.List>
    </styledEl.Section>
  )
}
