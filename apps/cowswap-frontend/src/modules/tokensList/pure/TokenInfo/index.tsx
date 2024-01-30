import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenName, TokenSymbol } from '@cowprotocol/ui'

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
      <div>
        <TokenSymbol token={token} />
        <styledEl.TokenName>
          <TokenName token={token} />
        </styledEl.TokenName>
      </div>
    </styledEl.Wrapper>
  )
}
