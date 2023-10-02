import { ReactNode } from 'react'

import * as styledEl from './styled'

import { TokenList } from '../../types'
import { TokenLogo } from '../TokenLogo'

export interface TokenListItemProps {
  list: TokenList
  className?: string
  children?: ReactNode
}

export function TokenListInfo(props: TokenListItemProps) {
  const { list, children, className } = props

  return (
    <styledEl.ListInfo className={className}>
      <div>
        <TokenLogo logoURI={list.logoUrl} size={36} />
      </div>
      <div>
        <styledEl.ListName>{list.name}</styledEl.ListName>
        <styledEl.TokensInfo>
          {list.tokensCount} tokens {children}
        </styledEl.TokensInfo>
      </div>
    </styledEl.ListInfo>
  )
}
