import { CheckCircle } from 'react-feather'

import * as styledEl from './styled'

import { TokenList } from '../../types'
import { TokenListInfo } from '../TokenListInfo'

export interface LoadedTokenListItemProps {
  list: TokenList
}

export function LoadedTokenListItem(props: LoadedTokenListItemProps) {
  const { list } = props

  return (
    <styledEl.Wrapper>
      <TokenListInfo list={list}></TokenListInfo>
      <div>
        <styledEl.LoadedInfo>
          <CheckCircle size={16} strokeWidth={2} />
          <span>Loaded</span>
        </styledEl.LoadedInfo>
      </div>
    </styledEl.Wrapper>
  )
}
