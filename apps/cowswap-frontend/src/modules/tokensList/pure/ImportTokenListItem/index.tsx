import * as styledEl from './styled'

import { TokenList } from '../../types'
import { ImportButton } from '../commonElements'
import { TokenListInfo } from '../TokenListInfo'

export interface ImportTokenListItemProps {
  list: TokenList
  importList(list: TokenList): void
}

export function ImportTokenListItem(props: ImportTokenListItemProps) {
  const { list } = props

  return (
    <styledEl.Wrapper>
      <TokenListInfo list={list}></TokenListInfo>
      <div>
        <ImportButton>Import</ImportButton>
      </div>
    </styledEl.Wrapper>
  )
}
