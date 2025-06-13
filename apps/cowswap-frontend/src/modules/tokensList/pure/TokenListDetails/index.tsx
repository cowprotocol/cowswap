import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { TokenList as UniTokenList } from '@uniswap/token-lists'

import * as styledEl from './styled'

export interface TokenListItemProps {
  list: UniTokenList
  className?: string
  children?: ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TokenListDetails(props: TokenListItemProps) {
  const { list, children, className } = props

  return (
    <styledEl.ListInfo className={className}>
      <div>
        <TokenLogo logoURI={list.logoURI} size={36} />
      </div>
      <div>
        <styledEl.ListName>{list.name}</styledEl.ListName>
        <styledEl.TokensInfo>
          {list.tokens.length} tokens {children}
        </styledEl.TokensInfo>
      </div>
    </styledEl.ListInfo>
  )
}
