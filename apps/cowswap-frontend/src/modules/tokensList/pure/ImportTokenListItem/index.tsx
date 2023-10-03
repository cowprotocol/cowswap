import { TokenListInfo } from '@cowprotocol/tokens'

import * as styledEl from './styled'

import { ImportButton } from '../commonElements'
import { TokenListDetails } from '../TokenListDetails'

export interface ImportTokenListItemProps {
  list: TokenListInfo
  importList(list: TokenListInfo): void
}

export function ImportTokenListItem(props: ImportTokenListItemProps) {
  const { list } = props

  return (
    <styledEl.Wrapper>
      <TokenListDetails list={list}></TokenListDetails>
      <div>
        <ImportButton>Import</ImportButton>
      </div>
    </styledEl.Wrapper>
  )
}
