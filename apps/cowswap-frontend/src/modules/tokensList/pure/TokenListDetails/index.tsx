import { ReactNode } from 'react'

import { TokenListInfo } from '@cowprotocol/tokens'

import * as styledEl from './styled'

import { TokenLogo } from '../TokenLogo'

export interface TokenListItemProps {
  list: TokenListInfo
  className?: string
  children?: ReactNode
}

export function TokenListDetails(props: TokenListItemProps) {
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
