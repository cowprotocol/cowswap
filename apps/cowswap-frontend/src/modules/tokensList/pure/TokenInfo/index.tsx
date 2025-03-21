import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenName, TokenSymbol } from '@cowprotocol/ui'

import { ClickableAddress } from 'common/pure/ClickableAddress'

import * as styledEl from './styled'

export interface TokenInfoProps {
  token: TokenWithLogo
  className?: string
}

export function TokenInfo(props: TokenInfoProps) {
  const { token, className } = props

  return (
    <styledEl.Wrapper className={className}>
      <TokenLogo token={token} sizeMobile={32} />
      <styledEl.TokenDetails>
        <styledEl.TokenSymbolWrapper>
          <TokenSymbol token={token} />
          <ClickableAddress address={token.address} chainId={token.chainId} />
        </styledEl.TokenSymbolWrapper>
        <styledEl.TokenName>
          <TokenName token={token} />
        </styledEl.TokenName>
      </styledEl.TokenDetails>
    </styledEl.Wrapper>
  )
}
