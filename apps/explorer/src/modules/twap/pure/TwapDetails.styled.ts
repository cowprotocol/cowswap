import { Color } from '@cowprotocol/ui'

import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import ExplorerTabs from 'explorer/components/common/ExplorerTabs/ExplorerTabs'
import styled from 'styled-components/macro'

export const TitleUid = styled(RowWithCopyButton)`
  color: ${Color.explorer_grey};
  font-size: var(--font-size-default);
  font-weight: var(--font-weight-normal);
  margin-left: 1rem;
  min-width: 0;
`

export const DetailsTabs = styled(ExplorerTabs)`
  margin-top: 2rem;
`

export const DetailsTable = styled(SimpleTable)`
  td {
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: normal;
  }

  td > div {
    align-items: center;
    min-width: 0;
  }

  a {
    color: ${Color.explorer_textActive};
  }
`

export const TokenAmount = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 0.4rem;
`

export const EmptyParts = styled.div`
  min-height: 12rem;
  padding: 3.2rem;
  font-size: 1.4rem;
  text-align: center;
`
