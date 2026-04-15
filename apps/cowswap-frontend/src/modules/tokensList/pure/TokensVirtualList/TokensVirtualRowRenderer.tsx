import { ReactNode } from 'react'

import { TokensVirtualRow } from './types'

import { SelectTokenContext } from '../../types'
import { FavoriteTokensList } from '../FavoriteTokensList'
import * as modalStyled from '../SelectTokenModal/styled'
import { TokenListItemContainer } from '../TokenListItemContainer'

interface TokensVirtualRowRendererProps {
  row: TokensVirtualRow
  selectTokenContext: SelectTokenContext
}

export function TokensVirtualRowRenderer({ row, selectTokenContext }: TokensVirtualRowRendererProps): ReactNode {
  switch (row.type) {
    case 'favorite-section':
      return (
        <FavoriteTokensList tokens={row.tokens} selectTokenContext={selectTokenContext} hideTooltip={row.hideTooltip} />
      )
    case 'title':
      return (
        <modalStyled.ListTitle>
          <span>{row.label}</span>
          {row.actionLabel && row.onAction ? (
            <modalStyled.ListTitleActionButton type="button" onClick={row.onAction}>
              {row.actionLabel}
            </modalStyled.ListTitleActionButton>
          ) : null}
        </modalStyled.ListTitle>
      )
    default:
      return (
        <TokenListItemContainer
          token={row.token}
          context={selectTokenContext}
          disabled={row.disabled}
          disabledReason={row.disabledReason}
        />
      )
  }
}
