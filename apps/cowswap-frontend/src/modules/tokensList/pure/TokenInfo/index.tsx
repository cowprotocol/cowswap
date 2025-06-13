import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenName, TokenSymbol } from '@cowprotocol/ui'

import { ClickableAddress } from 'common/pure/ClickableAddress'

import * as styledEl from './styled'

export interface TokenInfoProps {
  token: TokenWithLogo
  className?: string
  tags?: ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TokenInfo(props: TokenInfoProps) {
  const { token, className, tags } = props

  return (
    <styledEl.Wrapper className={className}>
      <TokenLogo token={token} sizeMobile={32} size={40} />
      <styledEl.TokenDetails>
        <styledEl.TokenSymbolWrapper>
          <TokenSymbol token={token} />
          <ClickableAddress address={token.address} chainId={token.chainId} />
        </styledEl.TokenSymbolWrapper>
        <styledEl.TokenNameRow>
          <TokenName token={token} />
          {tags}
        </styledEl.TokenNameRow>
      </styledEl.TokenDetails>
    </styledEl.Wrapper>
  )
}
