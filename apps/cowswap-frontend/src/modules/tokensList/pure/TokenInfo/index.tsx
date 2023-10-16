import { TokenSymbol } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { TokenWithLogo } from '../../types'
import { TokenLogo } from '../TokenLogo'

export interface TokenInfoProps {
  token: TokenWithLogo
  className?: string
}

export function TokenInfo(props: TokenInfoProps) {
  const { token, className } = props

  return (
    <styledEl.Wrapper className={className}>
      <TokenLogo logoURI={token.logoURI} />
      <div>
        <TokenSymbol token={token} />
        <styledEl.TokenName>{token.name}</styledEl.TokenName>
      </div>
    </styledEl.Wrapper>
  )
}
