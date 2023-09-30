import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { TokenSymbol } from '@cowprotocol/ui'

import { ExternalLink, Trash } from 'react-feather'

import * as styledEl from './styled'

import { PrimaryInput, PrimaryInputBox } from '../../pure/commonElements'
import { TokenLogo } from '../../pure/TokenLogo'
import { TokenWithLogo } from '../../types'

export interface ManageTokensProps {
  tokens: TokenWithLogo[]
}

export function ManageTokens(props: ManageTokensProps) {
  const { tokens } = props

  const clearAll = () => {
    console.log('TODO clearAll')
  }

  const removeToken = (token: TokenWithLogo) => {
    console.log('TODO removeToken', token.symbol)
  }

  return (
    <div>
      <PrimaryInputBox>
        <PrimaryInput type="text" placeholder="0x0000" />
      </PrimaryInputBox>
      <div>
        <styledEl.Header>
          <styledEl.Title>{tokens.length} Custom Tokens</styledEl.Title>
          <styledEl.LinkButton onClick={clearAll}>Clear all</styledEl.LinkButton>
        </styledEl.Header>
        <div>
          {tokens.map((token) => {
            return (
              <styledEl.TokenItem key={token.address}>
                <styledEl.TokenInfo>
                  <TokenLogo logoURI={token.logoURI} size={20} />
                  <TokenSymbol token={token} />
                </styledEl.TokenInfo>
                <div>
                  <styledEl.LinkButton onClick={() => removeToken(token)}>
                    <Trash size={16} />
                  </styledEl.LinkButton>
                  <styledEl.LinkButton>
                    <a
                      target="_blank"
                      href={getExplorerLink(token.chainId, token.address, ExplorerDataType.TOKEN)}
                      rel="noreferrer"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </styledEl.LinkButton>
                </div>
              </styledEl.TokenItem>
            )
          })}
        </div>
        <styledEl.TipText>Tip: Custom tokens are stored locally in your browser</styledEl.TipText>
      </div>
    </div>
  )
}
