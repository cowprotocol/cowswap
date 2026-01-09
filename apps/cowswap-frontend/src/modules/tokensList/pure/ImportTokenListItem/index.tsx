import { ReactElement } from 'react'

import { ListState } from '@cowprotocol/tokens'

import { Trans } from '@lingui/react/macro'
import { CheckCircle, AlertCircle } from 'react-feather'

import * as styledEl from './styled'

import { ImportButton } from '../commonElements'
import { TokenListDetails } from '../TokenListDetails'

export interface ImportTokenListItemProps {
  list: ListState
  source: 'existing' | 'external'
  isBlocked?: boolean
  blockReason?: string
  importList(list: ListState): void
}

export function ImportTokenListItem(props: ImportTokenListItemProps): ReactElement {
  const { list, source, importList, isBlocked, blockReason } = props

  return (
    <styledEl.Wrapper>
      <TokenListDetails list={list.list}></TokenListDetails>
      {source === 'existing' && !isBlocked ? (
        <styledEl.LoadedInfo>
          <CheckCircle size={16} strokeWidth={2} />
          <span>
            <Trans>Loaded</Trans>
          </span>
        </styledEl.LoadedInfo>
      ) : isBlocked ? (
        <styledEl.BlockedInfo>
          <AlertCircle size={16} strokeWidth={2} />
          <span>{blockReason || <Trans>Not available in your region</Trans>}</span>
        </styledEl.BlockedInfo>
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
