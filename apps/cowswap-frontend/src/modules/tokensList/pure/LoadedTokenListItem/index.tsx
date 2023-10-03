import { TokenListInfo } from '@cowprotocol/tokens'

import { CheckCircle } from 'react-feather'

import * as styledEl from './styled'

import { TokenListDetails } from '../TokenListDetails'

export interface LoadedTokenListItemProps {
  list: TokenListInfo
}

export function LoadedTokenListItem(props: LoadedTokenListItemProps) {
  const { list } = props

  return (
    <styledEl.Wrapper>
      <TokenListDetails list={list}></TokenListDetails>
      <div>
        <styledEl.LoadedInfo>
          <CheckCircle size={16} strokeWidth={2} />
          <span>Loaded</span>
        </styledEl.LoadedInfo>
      </div>
    </styledEl.Wrapper>
  )
}
