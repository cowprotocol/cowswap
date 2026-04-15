import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/react/macro'

import { FavoriteTokenItem } from './FavoriteTokenItem'
import { FavoriteTokensTooltip } from './FavoriteTokensTooltip'
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
        {tokens.map((token) => (
          <FavoriteTokenItem key={getTokenId(token)} token={token} selectTokenContext={selectTokenContext} />
        ))}
      </styledEl.List>
    </styledEl.Section>
  )
}
