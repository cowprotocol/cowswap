import { FetchedTokenList } from '@cowprotocol/tokens'

import { CheckCircle } from 'react-feather'

import * as styledEl from './styled'

import { ImportButton } from '../commonElements'
import { TokenListDetails } from '../TokenListDetails'

export interface ImportTokenListItemProps {
  list: FetchedTokenList
  source: 'existing' | 'external'
  importList(list: FetchedTokenList): void
}

export function ImportTokenListItem(props: ImportTokenListItemProps) {
  const { list, source, importList } = props

  return (
    <styledEl.Wrapper>
      <TokenListDetails list={list.info}></TokenListDetails>
      {source === 'existing' ? (
        <styledEl.LoadedInfo>
          <CheckCircle size={16} strokeWidth={2} />
          <span>Loaded</span>
        </styledEl.LoadedInfo>
      ) : (
        <div>
          <ImportButton onClick={() => importList(list)}>Import</ImportButton>
        </div>
      )}
    </styledEl.Wrapper>
  )
}
