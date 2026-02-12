import { ReactNode } from 'react'

import { GuideBanner } from './GuideBanner'
import { TokenSearchRowRendererProps } from './types'

import * as styledEl from '../../containers/TokenSearchResults/styled'
import { ImportTokenItem } from '../ImportTokenItem'
import { TokenListItemContainer } from '../TokenListItemContainer'
import { TokenSourceTitle } from '../TokenSourceTitle'

export function TokenSearchRowRenderer({
  row,
  selectTokenContext,
  importToken,
}: TokenSearchRowRendererProps): ReactNode {
  switch (row.type) {
    case 'banner':
      return <GuideBanner />
    case 'token':
      return (
        <TokenListItemContainer
          token={row.token}
          context={selectTokenContext}
          disabled={row.disabled}
          disabledReason={row.disabledReason}
        />
      )
    case 'section-title': {
      const tooltip = row.tooltip?.trim() || undefined
      return (
        <styledEl.SectionTitleRow>
          <TokenSourceTitle tooltip={tooltip}>{row.text}</TokenSourceTitle>
        </styledEl.SectionTitleRow>
      )
    }
    case 'import-token':
      return (
        <ImportTokenItem
          token={row.token}
          importToken={row.hideImport ? undefined : importToken}
          shadowed={row.shadowed}
          wrapperId={row.wrapperId}
          isFirstInSection={row.isFirstInSection}
          isLastInSection={row.isLastInSection}
          disabledReason={row.disabledReason}
        />
      )
    default:
      return null
  }
}
