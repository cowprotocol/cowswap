import { ReactElement } from 'react'

import { ListState } from '@cowprotocol/tokens'

import { Trans } from '@lingui/react/macro'
import { CheckCircle } from 'react-feather'

import * as styledEl from './styled'

import { ImportButton } from '../commonElements'
import { TokenListDetails } from '../TokenListDetails'

export interface ImportTokenListItemProps {
  list: ListState
  source: 'existing' | 'external'
  importList(list: ListState): void
}

export function ImportTokenListItem(props: ImportTokenListItemProps): ReactElement {
  const { list, source, importList } = props

  return (
    <styledEl.Wrapper>
      <TokenListDetails list={list.list}></TokenListDetails>
      {source === 'existing' ? (
        <styledEl.LoadedInfo>
          <CheckCircle size={16} strokeWidth={2} />
          <span>
            <Trans>Loaded</Trans>
          </span>
        </styledEl.LoadedInfo>
      ) : (
        <div>
          <ImportButton onClick={() => importList(list)}>
            <Trans>Import</Trans>
          </ImportButton>
        </div>
      )}
    </styledEl.Wrapper>
  )
}
